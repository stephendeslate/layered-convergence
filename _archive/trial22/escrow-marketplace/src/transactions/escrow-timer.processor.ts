import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStateMachine } from './transaction-state-machine';
import { TransactionStatus } from '@prisma/client';

@Processor('escrow-timer')
export class EscrowTimerProcessor extends WorkerHost {
  private readonly logger = new Logger(EscrowTimerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: TransactionStateMachine,
  ) {
    super();
  }

  async process(job: Job<{ transactionId: string; tenantId: string }>) {
    const { transactionId } = job.data;
    this.logger.log(`Processing auto-release for transaction ${transactionId}`);

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      this.logger.warn(`Transaction ${transactionId} not found`);
      return;
    }

    if (transaction.status !== TransactionStatus.HELD) {
      this.logger.log(`Transaction ${transactionId} is no longer HELD (status: ${transaction.status}), skipping`);
      return;
    }

    if (this.stateMachine.canTransition(transaction.status, TransactionStatus.RELEASED)) {
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.RELEASED },
      });

      await this.prisma.transactionStateHistory.create({
        data: {
          transactionId,
          fromState: TransactionStatus.HELD,
          toState: TransactionStatus.RELEASED,
          reason: 'Auto-released after hold period expired',
          changedBy: 'system',
        },
      });

      this.logger.log(`Transaction ${transactionId} auto-released`);
    }
  }
}
