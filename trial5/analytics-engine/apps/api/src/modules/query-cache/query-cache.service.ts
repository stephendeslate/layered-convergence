import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get(queryParams: Record<string, unknown>): Promise<unknown | null> {
    const hash = this.hashQuery(queryParams);

    // [JUSTIFIED:findFirst] Cache lookup — null means cache miss, not an error
    const cached = await this.prisma.queryCache.findFirst({
      where: {
        queryHash: hash,
        expiresAt: { gt: new Date() },
      },
    });

    if (cached) {
      this.logger.debug(`Cache hit for query hash ${hash}`);
      return cached.result;
    }

    return null;
  }

  async set(queryParams: Record<string, unknown>, result: unknown, ttlSeconds: number = 300) {
    const hash = this.hashQuery(queryParams);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.prisma.queryCache.upsert({
      where: { queryHash: hash },
      create: {
        queryHash: hash,
        result: result as Record<string, unknown>,
        expiresAt,
      },
      update: {
        result: result as Record<string, unknown>,
        expiresAt,
      },
    });

    this.logger.debug(`Cache set for query hash ${hash}, TTL ${ttlSeconds}s`);
  }

  async invalidateByPattern(pattern: string) {
    const result = await this.prisma.queryCache.deleteMany({
      where: {
        queryHash: { startsWith: pattern },
      },
    });

    this.logger.log(`Invalidated ${result.count} cache entries matching pattern ${pattern}`);
    return result.count;
  }

  async cleanExpired() {
    const result = await this.prisma.queryCache.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    this.logger.log(`Cleaned ${result.count} expired cache entries`);
    return result.count;
  }

  private hashQuery(queryParams: Record<string, unknown>): string {
    const sorted = JSON.stringify(queryParams, Object.keys(queryParams).sort());
    return createHash('sha256').update(sorted).digest('hex');
  }
}
