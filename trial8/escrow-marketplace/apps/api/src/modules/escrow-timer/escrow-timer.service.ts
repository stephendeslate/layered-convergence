import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EscrowTimerService {
  private readonly logger = new Logger(EscrowTimerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check for transactions that have exceeded their hold period
   * and auto-release them. This would be called by a BullMQ scheduled job.
   */
  async processExpiredHolds(): Promise<{ released: number; errors: string[] }> {
    const expiredTransactions = await this.prisma.transaction.findMany({
      where: {
        status: 'held',
        holdUntil: { lt: new Date() },
      },
    });

    this.logger.log(`Found ${expiredTransactions.length} expired holds to process`);

    let released = 0;
    const errors: string[] = [];

    for (const transaction of expiredTransactions) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: 'released' },
          });

          await tx.transactionStateHistory.create({
            data: {
              transactionId: transaction.id,
              fromState: 'held',
              toState: 'released',
              reason: 'Auto-released: hold period expired',
            },
          });
        });

        released++;
        this.logger.log(`Auto-released transaction ${transaction.id}`);
      } catch (error) {
        const msg = `Failed to auto-release ${transaction.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        this.logger.error(msg);
        errors.push(msg);
      }
    }

    return { released, errors };
  }

  /** Admin endpoint: view upcoming expirations. */
  async getUpcomingExpirations(hours: number = 24) {
    const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000);
    return this.prisma.transaction.findMany({
      where: {
        status: 'held',
        holdUntil: { lt: cutoff, gt: new Date() },
      },
      include: { buyer: true, provider: true },
      orderBy: { holdUntil: 'asc' },
    });
  }
}
