import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class QueryCacheService {
  private redis: Redis;
  private defaultTtl: number;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6380', 10),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    this.defaultTtl = parseInt(process.env.QUERY_CACHE_TTL ?? '300', 10);
  }

  generateHash(query: string, params: Record<string, any> = {}): string {
    const input = JSON.stringify({ query, params });
    return createHash('sha256').update(input).digest('hex');
  }

  async get<T = any>(queryHash: string): Promise<T | null> {
    const cached = await this.redis.get(`qc:${queryHash}`);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  }

  async set(queryHash: string, result: any, ttl?: number): Promise<void> {
    const expiry = ttl ?? this.defaultTtl;
    await this.redis.set(`qc:${queryHash}`, JSON.stringify(result), 'EX', expiry);
  }

  async invalidate(queryHash: string): Promise<void> {
    await this.redis.del(`qc:${queryHash}`);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(`qc:${pattern}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async getOrSet<T = any>(
    query: string,
    params: Record<string, any>,
    fetcher: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const hash = this.generateHash(query, params);
    const cached = await this.get<T>(hash);
    if (cached !== null) return cached;

    const result = await fetcher();
    await this.set(hash, result, ttl);
    return result;
  }
}
