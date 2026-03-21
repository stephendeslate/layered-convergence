import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, TransitionTransactionDto } from './transaction.dto';

// Valid state transitions for the transaction state machine
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['HELD'],
  HELD: ['RELEASED', 'DISPUTED', 'EXPIRED'],
  RELEASED: ['COMPLETED'],
  DISPUTED: ['REFUNDED', 'RELEASED'],
  COMPLETED: [],
  REFUNDED: [],
  EXPIRED: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        buyerId: userId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        status: 'PENDING',
        platformFee: dto.platformFee ?? Math.round(dto.amount * 0.05),
        holdUntil: dto.holdUntil ? new Date(dto.holdUntil) : null,
        description: dto.description,
      },
      include: { buyer: true, provider: true },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
      include: { buyer: true, provider: true, stateHistory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    return this.prisma.transaction.findFirstOrThrow({
      where: {
        id,
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'asc' } },
        dispute: true,
        payout: true,
      },
    });
  }

  async transition(userId: string, id: string, dto: TransitionTransactionDto) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: {
        id,
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
    });

    const allowedNext = VALID_TRANSITIONS[transaction.status] ?? [];
    if (!allowedNext.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${dto.toStatus}. ` +
        `Allowed: ${allowedNext.join(', ') || 'none'}`,
      );
    }

    // Side effect: when transaction is RELEASED, create a payout record
    if (dto.toStatus === 'RELEASED') {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.transaction.update({
          where: { id },
          data: { status: dto.toStatus as never },
          include: { buyer: true, provider: true },
        });

        await tx.transactionStateHistory.create({
          data: {
            transactionId: id,
            fromState: transaction.status,
            toState: dto.toStatus as never,
            reason: dto.reason,
          },
        });

        await tx.payout.create({
          data: {
            providerId: transaction.providerId,
            transactionId: id,
            amount: transaction.amount - transaction.platformFee,
            status: 'PENDING',
          },
        });

        return updated;
      });
    }

    // Side effect: when transaction is REFUNDED, update payout status to FAILED
    if (dto.toStatus === 'REFUNDED') {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.transaction.update({
          where: { id },
          data: { status: dto.toStatus as never },
          include: { buyer: true, provider: true },
        });

        await tx.transactionStateHistory.create({
          data: {
            transactionId: id,
            fromState: transaction.status,
            toState: dto.toStatus as never,
            reason: dto.reason,
          },
        });

        // [JUSTIFIED:findFirst] payout may not exist if refund happens before release
        const existingPayout = await tx.payout.findFirst({
          where: { transactionId: id },
        });
        if (existingPayout) {
          await tx.payout.update({
            where: { id: existingPayout.id },
            data: { status: 'FAILED' },
          });
        }

        return updated;
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: { status: dto.toStatus as never },
        include: { buyer: true, provider: true },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromState: transaction.status,
          toState: dto.toStatus as never,
          reason: dto.reason,
        },
      });

      return updated;
    });
  }

  async getAnalytics(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
    });

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const disputeCount = transactions.filter((t) => t.status === 'DISPUTED').length;

    return {
      totalTransactions: transactions.length,
      totalVolume,
      totalFees,
      disputeCount,
      disputeRate: transactions.length > 0 ? disputeCount / transactions.length : 0,
    };
  }
}
