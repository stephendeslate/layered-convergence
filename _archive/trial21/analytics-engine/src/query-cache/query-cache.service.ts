import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

const DEFAULT_TTL_SECONDS = 300;

@Injectable()
export class QueryCacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6380', 10),
      lazyConnect: true,
    });
  }

  async get(tenantId: string, queryHash: string): Promise<unknown | null> {
    const key = this.buildKey(tenantId, queryHash);
    const cached = await this.redis.get(key);
    if (!cached) return null;
    return JSON.parse(cached);
  }

  async set(
    tenantId: string,
    queryHash: string,
    result: unknown,
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    const key = this.buildKey(tenantId, queryHash);
    await this.redis.setex(key, ttlSeconds, JSON.stringify(result));
  }

  async invalidate(tenantId: string, queryHash: string): Promise<void> {
    const key = this.buildKey(tenantId, queryHash);
    await this.redis.del(key);
  }

  async invalidateAll(tenantId: string): Promise<void> {
    const pattern = `query_cache:${tenantId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private buildKey(tenantId: string, queryHash: string): string {
    return `query_cache:${tenantId}:${queryHash}`;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
