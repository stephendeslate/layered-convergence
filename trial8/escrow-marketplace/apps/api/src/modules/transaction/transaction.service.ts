import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

/**
 * Valid state transitions for the transaction state machine:
 *   pending -> held (payment captured)
 *   held -> released (service confirmed, funds transferred)
 *   held -> disputed (buyer raises dispute)
 *   held -> refunded (refund issued)
 *   held -> expired (hold period elapsed, auto-release triggered)
 *   disputed -> released (resolved in provider's favor)
 *   disputed -> refunded (resolved in buyer's favor)
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['held'],
  held: ['released', 'disputed', 'refunded', 'expired'],
  disputed: ['released', 'refunded'],
  // Terminal states: released, refunded, expired — no outgoing transitions
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    const platformFeePercent = dto.platformFeePercent ?? 10;
    const platformFeeAmount = Math.round(dto.amount * (platformFeePercent / 100));

    this.logger.log(`Creating transaction: buyer=${buyerId}, provider=${dto.providerId}, amount=${dto.amount}`);

    return this.prisma.transaction.create({
      data: {
        buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        platformFeePercent,
        platformFeeAmount,
        holdUntil: dto.holdUntil ? new Date(dto.holdUntil) : undefined,
        description: dto.description,
        status: 'pending',
      },
      include: { buyer: true, provider: true },
    });
  }

  async findAll(filters?: { buyerId?: string; providerId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.buyerId) where.buyerId = filters.buyerId;
    if (filters?.providerId) where.providerId = filters.providerId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.transaction.findMany({
      where,
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'desc' } },
        disputes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'desc' } },
        disputes: true,
        payout: true,
      },
    });
  }

  async transition(id: string, toState: string, reason?: string) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id },
    });

    const currentState = transaction.status;
    const allowed = VALID_TRANSITIONS[currentState] ?? [];

    if (!allowed.includes(toState)) {
      throw new BadRequestException(
        `Invalid state transition: ${currentState} -> ${toState}. ` +
        `Allowed transitions from "${currentState}": ${allowed.join(', ') || 'none (terminal state)'}`,
      );
    }

    this.logger.log(`Transaction ${id}: ${currentState} -> ${toState}`);

    return this.prisma.$transaction(async (tx) => {
      await tx.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromState: currentState,
          toState,
          reason,
        },
      });

      return tx.transaction.update({
        where: { id },
        data: { status: toState },
        include: { buyer: true, provider: true, stateHistory: true },
      });
    });
  }

  async getAnalytics() {
    const [totalCount, statusCounts, totalVolume] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        _sum2: { platformFeeAmount: true },
      }).catch(() => ({ _sum: { amount: 0 }, _sum2: { platformFeeAmount: 0 } })),
    ]);

    return {
      totalTransactions: totalCount,
      byStatus: statusCounts.map((s) => ({ status: s.status, count: s._count })),
      totalVolume: totalVolume._sum?.amount ?? 0,
    };
  }
}
