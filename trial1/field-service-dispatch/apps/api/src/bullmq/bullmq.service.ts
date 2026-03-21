import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';

export const QUEUE_NAMES = {
  ROUTE_OPTIMIZATION: 'route-optimization',
  NOTIFICATIONS: 'notifications',
  INVOICE_GENERATION: 'invoice-generation',
  REMINDERS: 'reminders',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

@Injectable()
export class BullMqService implements OnModuleDestroy {
  private readonly logger = new Logger(BullMqService.name);
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly redis: RedisService) {
    for (const name of Object.values(QUEUE_NAMES)) {
      const queue = new Queue(name, {
        connection: this.redis.client.duplicate() as any,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      });
      this.queues.set(name, queue);
      this.logger.log(`Queue "${name}" initialized`);
    }
  }

  getQueue(name: QueueName): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue "${name}" not found`);
    }
    return queue;
  }

  async addJob<T>(queueName: QueueName, jobName: string, data: T) {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data);
  }

  async onModuleDestroy() {
    for (const [name, queue] of this.queues) {
      await queue.close();
      this.logger.log(`Queue "${name}" closed`);
    }
  }
}
