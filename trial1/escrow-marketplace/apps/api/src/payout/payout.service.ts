import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  TransactionStatus,
  PayoutStatus,
  AuditAction,
} from '@prisma/client';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Create Payout Record ──────────────────────────────────────────────────

  async createPayout(transactionId: string) {
    const txn = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { provider: { include: { connectedAccount: true } } },
    });

    if (!txn) {
      throw new NotFoundException('Transaction not found');
    }

    if (txn.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException(
        'Payout can only be created for RELEASED transactions',
      );
    }

    if (!txn.provider.connectedAccount) {
      throw new BadRequestException(
        'Provider does not have a connected account',
      );
    }

    // Check if payout already exists
    const existing = await this.prisma.payout.findUnique({
      where: { transactionId },
    });
    if (existing) {
      return existing;
    }

    const payout = await this.prisma.payout.create({
      data: {
        transactionId,
        connectedAccountId: txn.provider.connectedAccount.id,
        amount: txn.providerAmount,
        status: PayoutStatus.PENDING,
      },
    });

    await this.audit.logTransition({
      transactionId,
      fromStatus: TransactionStatus.RELEASED,
      toStatus: TransactionStatus.RELEASED,
      action: AuditAction.PAYOUT_INITIATED,
      actorId: null,
      metadata: { payoutId: payout.id },
    });

    return payout;
  }

  // ─── Update Payout Status ──────────────────────────────────────────────────

  async markPayoutPaid(stripePayoutId: string) {
    const payout = await this.prisma.payout.findFirst({
      where: { stripePayoutId },
    });

    if (!payout) {
      this.logger.warn(`No payout found for Stripe payout ${stripePayoutId}`);
      return null;
    }

    return this.prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.PAID,
        paidAt: new Date(),
      },
    });
  }

  async markPayoutFailed(stripePayoutId: string, failureReason: string) {
    const payout = await this.prisma.payout.findFirst({
      where: { stripePayoutId },
    });

    if (!payout) {
      this.logger.warn(`No payout found for Stripe payout ${stripePayoutId}`);
      return null;
    }

    await this.audit.logTransition({
      transactionId: payout.transactionId,
      fromStatus: TransactionStatus.RELEASED,
      toStatus: TransactionStatus.RELEASED,
      action: AuditAction.PAYOUT_FAILED,
      actorId: null,
      metadata: { payoutId: payout.id, failureReason },
    });

    return this.prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.FAILED,
        failureReason,
      },
    });
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

  async getPayout(payoutId: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: { transaction: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }

  async listPayouts(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const where = {
      connectedAccount: { userId },
    };

    const [data, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        include: { transaction: { select: { description: true, amount: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
