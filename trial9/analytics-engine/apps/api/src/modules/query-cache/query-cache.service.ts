import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  private hashQuery(query: Record<string, unknown>): string {
    return createHash('sha256').update(JSON.stringify(query)).digest('hex');
  }

  async get(query: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const queryHash = this.hashQuery(query);
    // findFirst justified: queryHash has a @unique constraint, but we want null
    // instead of throwing when the cache entry doesn't exist or is expired.
    const cached = await this.prisma.queryCache.findFirst({
      where: { queryHash, expiresAt: { gt: new Date() } },
    });
    if (cached) {
      this.logger.debug(`Cache hit for query hash: ${queryHash.substring(0, 8)}`);
      return cached.result as Record<string, unknown>;
    }
    return null;
  }

  async set(query: Record<string, unknown>, result: Record<string, unknown>, ttlMs?: number): Promise<void> {
    const queryHash = this.hashQuery(query);
    const expiresAt = new Date(Date.now() + (ttlMs ?? this.DEFAULT_TTL_MS));

    await this.prisma.queryCache.upsert({
      where: { queryHash },
      update: { result, expiresAt },
      create: { queryHash, result, expiresAt },
    });
  }

  async invalidate(queryHash: string): Promise<void> {
    await this.prisma.queryCache.deleteMany({ where: { queryHash } });
  }

  async cleanup(): Promise<number> {
    const result = await this.prisma.queryCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Cleaned up ${result.count} expired cache entries`);
    return result.count;
  }
}
