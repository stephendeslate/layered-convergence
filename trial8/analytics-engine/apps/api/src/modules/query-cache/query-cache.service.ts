import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toJsonValue, fromJsonValue } from '../../common/helpers/json.helper';
import { createHash } from 'crypto';

@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get<T>(queryKey: string): Promise<T | null> {
    const hash = this.hashQuery(queryKey);

    // findFirst justified: cache entries are optional and may not exist —
    // returning null simply means the query is not cached
    const cached = await this.prisma.queryCache.findFirst({
      where: {
        queryHash: hash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!cached) return null;

    this.logger.debug(`Cache hit for query hash ${hash}`);
    return fromJsonValue<T>(cached.result);
  }

  async set(queryKey: string, result: Record<string, unknown> | unknown[], ttlSeconds: number = 300): Promise<void> {
    const hash = this.hashQuery(queryKey);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.prisma.queryCache.upsert({
      where: { queryHash: hash },
      update: { result: toJsonValue(result), expiresAt },
      create: { queryHash: hash, result: toJsonValue(result), expiresAt },
    });
  }

  async invalidate(queryKey: string): Promise<void> {
    const hash = this.hashQuery(queryKey);
    await this.prisma.queryCache.deleteMany({ where: { queryHash: hash } });
  }

  /** Admin endpoint: clear all expired cache entries. */
  async clearExpired(): Promise<number> {
    const result = await this.prisma.queryCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Cleared ${result.count} expired cache entries`);
    return result.count;
  }

  private hashQuery(queryKey: string): string {
    return createHash('sha256').update(queryKey).digest('hex');
  }
}
