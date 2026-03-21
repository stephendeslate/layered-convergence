import { Module, Global } from '@nestjs/common';
import { Queue } from 'bullmq';

export const DATA_SYNC_QUEUE = 'data-sync';
export const AGGREGATION_QUEUE = 'aggregation';
export const CACHE_INVALIDATION_QUEUE = 'cache-invalidation';

function getRedisConnection() {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379', 10),
    password: parsed.password || undefined,
    db: parsed.pathname ? parseInt(parsed.pathname.slice(1) || '0', 10) : 0,
    maxRetriesPerRequest: null as null,
  };
}

const queueFactory = (name: string) => ({
  provide: `BULLMQ_QUEUE_${name.toUpperCase().replace(/-/g, '_')}`,
  useFactory: () => {
    return new Queue(name, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  },
});

@Global()
@Module({
  providers: [
    queueFactory(DATA_SYNC_QUEUE),
    queueFactory(AGGREGATION_QUEUE),
    queueFactory(CACHE_INVALIDATION_QUEUE),
  ],
  exports: [
    `BULLMQ_QUEUE_${DATA_SYNC_QUEUE.toUpperCase().replace(/-/g, '_')}`,
    `BULLMQ_QUEUE_${AGGREGATION_QUEUE.toUpperCase().replace(/-/g, '_')}`,
    `BULLMQ_QUEUE_${CACHE_INVALIDATION_QUEUE.toUpperCase().replace(/-/g, '_')}`,
  ],
})
export class BullmqModule {}
