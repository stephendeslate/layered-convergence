import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createHash } from 'crypto';

@Injectable()
export class QueryCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly redis: Redis;
  private readonly defaultTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.redis = new Redis({ host, port, lazyConnect: true });
    this.defaultTtlSeconds = this.configService.get<number>('QUERY_CACHE_TTL', 300);

    this.redis.on('error', (err: Error) => {
      this.logger.warn(`Redis connection error (caching disabled): ${err.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  generateCacheKey(tenantId: string, params: Record<string, unknown>): string {
    const hash = createHash('sha256')
      .update(JSON.stringify({ tenantId, ...params }))
      .digest('hex');
    return `query:${tenantId}:${hash}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;

      this.logger.debug(`Cache hit: ${key}`);
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds ?? this.defaultTtlSeconds;
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch {
      this.logger.warn(`Failed to set cache for key: ${key}`);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Invalidated ${keys.length} cache entries matching: ${pattern}`);
      }
    } catch {
      this.logger.warn(`Failed to invalidate cache for pattern: ${pattern}`);
    }
  }

  async invalidateForTenant(tenantId: string): Promise<void> {
    await this.invalidate(`query:${tenantId}:*`);
  }
}
