import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetCacheDto } from './query-cache.dto';

@Injectable()
export class QueryCacheService {
  constructor(private readonly prisma: PrismaService) {}

  async get(tenantId: string, queryHash: string) {
    const cached = await this.prisma.queryCache.findUnique({
      where: {
        tenantId_queryHash: { tenantId, queryHash },
      },
    });

    if (!cached || cached.expiresAt < new Date()) {
      if (cached) {
        await this.prisma.queryCache.delete({
          where: { id: cached.id },
        });
      }
      return null;
    }

    return cached;
  }

  async set(tenantId: string, dto: SetCacheDto) {
    const ttlSeconds = dto.ttl ?? 300;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return this.prisma.queryCache.upsert({
      where: {
        tenantId_queryHash: { tenantId, queryHash: dto.queryHash },
      },
      create: {
        tenantId,
        queryHash: dto.queryHash,
        result: dto.result,
        expiresAt,
      },
      update: {
        result: dto.result,
        expiresAt,
      },
    });
  }

  async invalidate(tenantId: string, queryHash: string) {
    try {
      await this.prisma.queryCache.delete({
        where: {
          tenantId_queryHash: { tenantId, queryHash },
        },
      });
    } catch {
      // Record may not exist — that's acceptable for cache invalidation
    }
  }

  async invalidateAll(tenantId: string) {
    await this.prisma.queryCache.deleteMany({
      where: { tenantId },
    });
  }

  async cleanup() {
    await this.prisma.queryCache.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
