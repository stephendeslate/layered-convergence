import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class EscrowTimerService {
  private readonly logger = new Logger(EscrowTimerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check for expired holds and auto-release funds.
   * Convention 5.18: background service with admin endpoint for observability.
   */
  async processExpiredHolds(): Promise<{ processed: number; expired: string[] }> {
    const now = new Date();
    const expiredTransactions = await this.prisma.transaction.findMany({
      where: {
        status: TransactionStatus.HELD,
        holdUntil: { lte: now },
      },
    });

    const expired: string[] = [];

    for (const transaction of expiredTransactions) {
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.RELEASED },
        });

        await tx.transactionStateHistory.create({
          data: {
            transactionId: transaction.id,
            fromState: TransactionStatus.HELD,
            toState: TransactionStatus.RELEASED,
            reason: 'Hold period expired — auto-released to provider',
          },
        });
      });

      expired.push(transaction.id);
      this.logger.log(`Auto-released transaction ${transaction.id} after hold expiry`);
    }

    return { processed: expiredTransactions.length, expired };
  }

  /**
   * Admin endpoint: get timer status.
   */
  async getStatus() {
    const heldCount = await this.prisma.transaction.count({
      where: { status: TransactionStatus.HELD },
    });

    const expiringSoon = await this.prisma.transaction.count({
      where: {
        status: TransactionStatus.HELD,
        holdUntil: {
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // within 24h
        },
      },
    });

    return { heldTransactions: heldCount, expiringSoon };
  }
}
