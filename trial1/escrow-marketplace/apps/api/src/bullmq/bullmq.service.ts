import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, JobsOptions } from 'bullmq';

export const QUEUE_NAMES = {
  WEBHOOK_PROCESSING: 'webhook-processing',
  PAYOUT_SCHEDULING: 'payout-scheduling',
  AUTO_RELEASE: 'auto-release',
} as const;

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

@Injectable()
export class BullMqService implements OnModuleDestroy {
  public readonly webhookQueue: Queue;
  public readonly payoutQueue: Queue;
  public readonly autoReleaseQueue: Queue;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    const connectionOpts = { connection: { url: redisUrl } };

    this.webhookQueue = new Queue(QUEUE_NAMES.WEBHOOK_PROCESSING, {
      ...connectionOpts,
      defaultJobOptions: { ...DEFAULT_JOB_OPTIONS },
    });

    this.payoutQueue = new Queue(QUEUE_NAMES.PAYOUT_SCHEDULING, {
      ...connectionOpts,
      defaultJobOptions: { ...DEFAULT_JOB_OPTIONS },
    });

    this.autoReleaseQueue = new Queue(QUEUE_NAMES.AUTO_RELEASE, {
      ...connectionOpts,
      defaultJobOptions: {
        ...DEFAULT_JOB_OPTIONS,
        backoff: { type: 'exponential', delay: 30000 },
      },
    });
  }

  async onModuleDestroy() {
    await Promise.all([
      this.webhookQueue.close(),
      this.payoutQueue.close(),
      this.autoReleaseQueue.close(),
    ]);
  }

  /**
   * Add a webhook event to the processing queue.
   */
  async enqueueWebhook(eventId: string, eventType: string, data: unknown) {
    return this.webhookQueue.add(
      eventType,
      { eventId, eventType, data },
      { jobId: `webhook:${eventId}` },
    );
  }

  /**
   * Schedule an auto-release job with a delay.
   */
  async scheduleAutoRelease(transactionId: string, delayMs: number) {
    return this.autoReleaseQueue.add(
      'auto-release',
      { transactionId },
      {
        jobId: `auto-release:${transactionId}`,
        delay: delayMs,
      },
    );
  }

  /**
   * Cancel a pending auto-release job.
   */
  async cancelAutoRelease(transactionId: string) {
    const job = await this.autoReleaseQueue.getJob(
      `auto-release:${transactionId}`,
    );
    if (job) {
      await job.remove();
    }
  }
}
