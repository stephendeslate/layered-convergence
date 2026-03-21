import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class EscrowTimerService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAndReleaseExpired() {
    const now = new Date();

    const expiredTransactions = await this.prisma.transaction.findMany({
      where: {
        status: TransactionStatus.HELD,
        holdUntil: { lte: now },
      },
    });

    const results = [];
    for (const tx of expiredTransactions) {
      const [updated] = await this.prisma.$transaction([
        this.prisma.transaction.update({
          where: { id: tx.id },
          data: { status: TransactionStatus.RELEASED },
        }),
        this.prisma.transactionStateHistory.create({
          data: {
            transactionId: tx.id,
            fromState: TransactionStatus.HELD,
            toState: TransactionStatus.RELEASED,
            reason: 'Auto-released after hold period expired',
          },
        }),
      ]);
      results.push(updated);
    }

    return { released: results.length, transactions: results };
  }

  async getStatus() {
    const activeTimers = await this.prisma.transaction.count({
      where: {
        status: TransactionStatus.HELD,
        holdUntil: { gt: new Date() },
      },
    });

    const nextExpiry = await this.prisma.transaction.findFirst({
      where: {
        status: TransactionStatus.HELD,
        holdUntil: { gt: new Date() },
      },
      orderBy: { holdUntil: 'asc' },
      select: { holdUntil: true },
    }); // [JUSTIFIED:FIND_FIRST] — finding the earliest expiry, null is valid (no pending timers)

    return {
      activeTimers,
      nextExpiry: nextExpiry?.holdUntil ?? null,
    };
  }
}
