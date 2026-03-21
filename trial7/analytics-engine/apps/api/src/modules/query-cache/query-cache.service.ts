import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { toJsonField, fromJsonField } from '../../common/helpers/json-field.helper';
import { createHash } from 'crypto';

@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get<T>(queryKey: string): Promise<T | null> {
    const hash = this.hashKey(queryKey);
    const cached = await this.prisma.queryCache.findUnique({
      where: { queryHash: hash },
    });

    if (!cached) return null;

    if (cached.expiresAt < new Date()) {
      await this.prisma.queryCache.delete({ where: { id: cached.id } });
      return null;
    }

    return fromJsonField<T>(cached.result);
  }

  async set<T>(queryKey: string, result: T, ttlSeconds: number = 300): Promise<void> {
    const hash = this.hashKey(queryKey);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.prisma.queryCache.upsert({
      where: { queryHash: hash },
      update: {
        result: toJsonField(result),
        expiresAt,
      },
      create: {
        queryHash: hash,
        result: toJsonField(result),
        expiresAt,
      },
    });
  }

  /**
   * Admin endpoint: clear expired cache entries.
   */
  async clearExpired(): Promise<{ deleted: number }> {
    const result = await this.prisma.queryCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Cleared ${result.count} expired cache entries`);
    return { deleted: result.count };
  }

  /**
   * Admin endpoint: get cache statistics.
   */
  async getStats() {
    const total = await this.prisma.queryCache.count();
    const expired = await this.prisma.queryCache.count({
      where: { expiresAt: { lt: new Date() } },
    });
    return { total, expired, active: total - expired };
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}
