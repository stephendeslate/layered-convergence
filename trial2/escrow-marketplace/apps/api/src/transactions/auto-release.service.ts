import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AUTO_RELEASE_QUEUE, AutoReleaseJobData } from './auto-release.processor';

@Injectable()
export class AutoReleaseService {
  private readonly logger = new Logger(AutoReleaseService.name);

  constructor(
    @InjectQueue(AUTO_RELEASE_QUEUE) private autoReleaseQueue: Queue<AutoReleaseJobData>,
  ) {}

  async scheduleAutoRelease(transactionId: string, holdExpiresAt: Date): Promise<void> {
    const delay = holdExpiresAt.getTime() - Date.now();

    if (delay <= 0) {
      this.logger.warn(
        `Hold expiration for transaction ${transactionId} is in the past, releasing immediately`,
      );
    }

    await this.autoReleaseQueue.add(
      'auto-release',
      { transactionId },
      {
        delay: Math.max(delay, 0),
        jobId: `auto-release-${transactionId}`,
        removeOnComplete: true,
        removeOnFail: { count: 5 },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    this.logger.log(
      `Scheduled auto-release for transaction ${transactionId} at ${holdExpiresAt.toISOString()}`,
    );
  }

  async cancelAutoRelease(transactionId: string): Promise<void> {
    const job = await this.autoReleaseQueue.getJob(`auto-release-${transactionId}`);
    if (job) {
      await job.remove();
      this.logger.log(`Cancelled auto-release for transaction ${transactionId}`);
    }
  }
}
