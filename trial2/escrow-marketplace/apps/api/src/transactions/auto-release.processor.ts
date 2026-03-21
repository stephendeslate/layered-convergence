import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TransactionsService } from './transactions.service';

export const AUTO_RELEASE_QUEUE = 'auto-release';

export interface AutoReleaseJobData {
  transactionId: string;
}

@Processor(AUTO_RELEASE_QUEUE)
export class AutoReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(AutoReleaseProcessor.name);

  constructor(private transactionsService: TransactionsService) {
    super();
  }

  async process(job: Job<AutoReleaseJobData>): Promise<void> {
    const { transactionId } = job.data;
    this.logger.log(`Processing auto-release for transaction ${transactionId}`);

    try {
      await this.transactionsService.releaseTransaction(
        transactionId,
        'system',
        'AUTO_RELEASED',
        'Auto-released after hold period expired',
      );
      this.logger.log(`Transaction ${transactionId} auto-released successfully`);
    } catch (error) {
      this.logger.warn(
        `Auto-release failed for ${transactionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
