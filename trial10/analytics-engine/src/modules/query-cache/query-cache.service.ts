import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';

/**
 * Query cache service for caching aggregated query results.
 * No DTO required — inputs come from internal service calls,
 * not from HTTP request bodies (convention 5.31).
 */
@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly DEFAULT_TTL_SECONDS = 300; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  async get(queryKey: string): Promise<unknown | null> {
    const hash = this.hashKey(queryKey);
    // findFirst justified: queryHash is unique, but we want to check expiry in the same query
    // without throwing if expired/missing (convention 5.26)
    const cached = await this.prisma.queryCache.findFirst({
      where: {
        queryHash: hash,
        expiresAt: { gt: new Date() },
      },
    });
    return cached?.result ?? null;
  }

  async set(queryKey: string, result: unknown, ttlSeconds?: number): Promise<void> {
    const hash = this.hashKey(queryKey);
    const expiresAt = new Date(Date.now() + (ttlSeconds ?? this.DEFAULT_TTL_SECONDS) * 1000);

    await this.prisma.queryCache.upsert({
      where: { queryHash: hash },
      create: { queryHash: hash, result: result as object, expiresAt },
      update: { result: result as object, expiresAt },
    });
  }

  async invalidate(queryKey: string): Promise<void> {
    const hash = this.hashKey(queryKey);
    await this.prisma.queryCache.deleteMany({
      where: { queryHash: hash },
    });
  }

  async cleanExpired(): Promise<number> {
    const result = await this.prisma.queryCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Cleaned ${result.count} expired cache entries`);
    return result.count;
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}
