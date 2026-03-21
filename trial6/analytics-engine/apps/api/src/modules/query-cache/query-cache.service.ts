import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheStatusDto } from './dto/cache-status.dto';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';
import { toJsonField, fromJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class QueryCacheService {
  constructor(private readonly prisma: PrismaService) {}

  async getCachedResult<T>(queryHash: string): Promise<T | null> {
    const cached = await this.prisma.queryCache.findFirst({
      where: { queryHash, expiresAt: { gt: new Date() } },
    }); // [JUSTIFIED:FIND_FIRST] — cache lookup, null return is valid (cache miss)

    if (!cached) return null;
    return fromJsonField<T>(cached.result);
  }

  async setCachedResult<T>(queryHash: string, result: T, ttlMs = 300000) {
    return this.prisma.queryCache.upsert({
      where: { queryHash },
      update: {
        result: toJsonField(result),
        expiresAt: new Date(Date.now() + ttlMs),
      },
      create: {
        queryHash,
        result: toJsonField(result),
        expiresAt: new Date(Date.now() + ttlMs),
      },
    });
  }

  async getStatus(): Promise<CacheStatusDto> {
    const now = new Date();
    const [total, expired] = await Promise.all([
      this.prisma.queryCache.count(),
      this.prisma.queryCache.count({ where: { expiresAt: { lt: now } } }),
    ]);

    return {
      totalEntries: total,
      expiredEntries: expired,
      activeEntries: total - expired,
    };
  }

  async invalidate(dto: InvalidateCacheDto) {
    if (dto.queryHash) {
      return this.prisma.queryCache.delete({
        where: { queryHash: dto.queryHash },
      });
    }

    // Invalidate all expired entries
    const result = await this.prisma.queryCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return { deletedCount: result.count };
  }
}
