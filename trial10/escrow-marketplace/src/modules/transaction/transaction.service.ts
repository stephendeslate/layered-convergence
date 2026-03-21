import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

/**
 * Valid state transitions for the transaction state machine.
 * Uses BadRequestException for invalid transitions (convention 5.24).
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['held'],
  held: ['released', 'disputed', 'expired'],
  disputed: ['released', 'refunded'],
  released: [],
  refunded: [],
  expired: ['refunded'],
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private readonly PLATFORM_FEE_PERCENT = 5; // 5% platform fee

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    const platformFee = Math.round(dto.amount * (this.PLATFORM_FEE_PERCENT / 100));

    return this.prisma.transaction.create({
      data: {
        buyerId: dto.buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        platformFee,
        description: dto.description,
        holdUntil: dto.holdUntil ? new Date(dto.holdUntil) : undefined,
        status: 'pending',
      },
    });
  }

  async findAll(filters?: { buyerId?: string; providerId?: string; status?: string }) {
    return this.prisma.transaction.findMany({
      where: filters,
      include: { stateHistory: true, disputes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: {
        stateHistory: { orderBy: { timestamp: 'asc' } },
        disputes: true,
        buyer: true,
        provider: true,
      },
    });
  }

  async transition(id: string, toState: string, reason?: string) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id },
    });

    const allowedTransitions = VALID_TRANSITIONS[transaction.status];
    if (!allowedTransitions || !allowedTransitions.includes(toState)) {
      throw new BadRequestException(
        `Invalid state transition: ${transaction.status} -> ${toState}. Allowed: ${allowedTransitions?.join(', ') ?? 'none'}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromState: transaction.status,
          toState,
          reason,
        },
      });

      return tx.transaction.update({
        where: { id },
        data: { status: toState },
        include: { stateHistory: true },
      });
    });
  }

  async hold(id: string) {
    return this.transition(id, 'held', 'Payment captured and held');
  }

  async release(id: string, reason?: string) {
    return this.transition(id, 'released', reason ?? 'Service delivery confirmed');
  }

  async refund(id: string, reason?: string) {
    return this.transition(id, 'refunded', reason ?? 'Refund processed');
  }

  async expire(id: string) {
    return this.transition(id, 'expired', 'Hold period expired');
  }

  async getAnalytics() {
    const transactions = await this.prisma.transaction.findMany();
    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const disputeCount = transactions.filter((t) => t.status === 'disputed').length;

    return {
      totalTransactions: transactions.length,
      totalVolume,
      totalFees,
      disputeCount,
      disputeRate: transactions.length > 0 ? disputeCount / transactions.length : 0,
      byStatus: transactions.reduce(
        (acc, t) => {
          acc[t.status] = (acc[t.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
