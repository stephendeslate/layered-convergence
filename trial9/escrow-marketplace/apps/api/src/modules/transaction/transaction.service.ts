import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTransactionDto } from './transaction.dto';

/**
 * Transaction state machine:
 *
 *   held → released    (buyer confirms delivery or auto-release timer fires)
 *   held → disputed    (buyer raises dispute)
 *   held → expired     (hold period expires without action)
 *   disputed → released    (resolved in provider's favor)
 *   disputed → refunded    (resolved in buyer's favor)
 *   disputed → escalated   (escalated to Stripe)
 *
 * Invalid transitions throw BadRequestException (not InternalServerError)
 * because the caller is attempting an action that is not allowed in the
 * current state — this is a client error, not a server error.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  held: ['released', 'disputed', 'expired'],
  disputed: ['released', 'refunded', 'escalated'],
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private readonly PLATFORM_FEE_PERCENT = 5; // 5% platform fee

  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    const platformFee = Math.round(dto.amount * (this.PLATFORM_FEE_PERCENT / 100));
    const holdUntil = dto.holdUntil ? new Date(dto.holdUntil) : new Date(Date.now() + 14 * 24 * 3600000); // 14 days default

    const transaction = await this.prisma.transaction.create({
      data: {
        buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        status: 'held',
        platformFee,
        holdUntil,
        description: dto.description,
      },
    });

    await this.recordStateChange(transaction.id, 'created', 'held', 'Transaction created with payment hold');
    this.logger.log(`Transaction created: ${transaction.id} — $${(dto.amount / 100).toFixed(2)}`);
    return transaction;
  }

  async findAll(filters?: { buyerId?: string; providerId?: string; status?: string }) {
    return this.prisma.transaction.findMany({
      where: {
        ...(filters?.buyerId && { buyerId: filters.buyerId }),
        ...(filters?.providerId && { providerId: filters.providerId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { stateHistory: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'asc' } },
        disputes: true,
      },
    });
  }

  async transition(id: string, toState: string, reason?: string) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({ where: { id } });
    const allowed = VALID_TRANSITIONS[transaction.status] ?? [];

    if (!allowed.includes(toState)) {
      throw new BadRequestException(
        `Cannot transition from '${transaction.status}' to '${toState}'. Allowed: [${allowed.join(', ')}]`,
      );
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status: toState },
    });

    await this.recordStateChange(id, transaction.status, toState, reason);
    this.logger.log(`Transaction ${id}: ${transaction.status} → ${toState}`);
    return updated;
  }

  async release(id: string, reason?: string) {
    return this.transition(id, 'released', reason ?? 'Delivery confirmed — funds released');
  }

  async dispute(id: string, reason?: string) {
    return this.transition(id, 'disputed', reason ?? 'Dispute raised by buyer');
  }

  async refund(id: string, reason?: string) {
    return this.transition(id, 'refunded', reason ?? 'Dispute resolved in buyer favor');
  }

  async expire(id: string) {
    return this.transition(id, 'expired', 'Hold period expired');
  }

  private async recordStateChange(transactionId: string, fromState: string, toState: string, reason?: string) {
    await this.prisma.transactionStateHistory.create({
      data: { transactionId, fromState, toState, reason },
    });
  }

  /**
   * Analytics: transaction summary for admin dashboard.
   */
  async getAnalytics() {
    const [total, held, released, disputed, refunded] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: 'held' } }),
      this.prisma.transaction.count({ where: { status: 'released' } }),
      this.prisma.transaction.count({ where: { status: 'disputed' } }),
      this.prisma.transaction.count({ where: { status: 'refunded' } }),
    ]);

    const totalVolume = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
    });

    const totalFees = await this.prisma.transaction.aggregate({
      where: { status: 'released' },
      _sum: { platformFee: true },
    });

    return {
      total,
      byStatus: { held, released, disputed, refunded },
      totalVolume: totalVolume._sum.amount ?? 0,
      totalFees: totalFees._sum.platformFee ?? 0,
      disputeRate: total > 0 ? ((disputed / total) * 100).toFixed(1) : '0.0',
    };
  }
}
