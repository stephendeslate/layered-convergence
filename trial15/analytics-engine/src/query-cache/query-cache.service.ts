import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class QueryCacheService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly defaultTtl: number;

  constructor() {
    const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    this.defaultTtl = parseInt(process.env['CACHE_TTL'] ?? '300', 10);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  private buildKey(tenantId: string, namespace: string, key: string): string {
    return `analytics:${tenantId}:${namespace}:${key}`;
  }

  async get<T>(tenantId: string, namespace: string, key: string): Promise<T | null> {
    const cacheKey = this.buildKey(tenantId, namespace, key);
    const data = await this.redis.get(cacheKey);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(
    tenantId: string,
    namespace: string,
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void> {
    const cacheKey = this.buildKey(tenantId, namespace, key);
    const serialized = JSON.stringify(value);
    const effectiveTtl = ttl ?? this.defaultTtl;

    await this.redis.setex(cacheKey, effectiveTtl, serialized);
  }

  async invalidate(tenantId: string, namespace: string, key: string): Promise<void> {
    const cacheKey = this.buildKey(tenantId, namespace, key);
    await this.redis.del(cacheKey);
  }

  async invalidateNamespace(tenantId: string, namespace: string): Promise<void> {
    const pattern = this.buildKey(tenantId, namespace, '*');
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async invalidateTenant(tenantId: string): Promise<void> {
    const pattern = `analytics:${tenantId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async getOrSet<T>(
    tenantId: string,
    namespace: string,
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(tenantId, namespace, key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(tenantId, namespace, key, value, ttl);
    return value;
  }

  /** Exposed for testing purposes */
  getRedisClient(): Redis {
    return this.redis;
  }
}
