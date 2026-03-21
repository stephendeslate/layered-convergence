import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueryCacheService {
  constructor(private readonly prisma: PrismaService) {}

  async get(queryHash: string) {
    const entry = await this.prisma.queryCache.findUnique({
      where: { queryHash },
    });

    if (!entry) return null;
    if (new Date() > entry.expiresAt) {
      await this.prisma.queryCache.delete({ where: { queryHash } });
      return null;
    }

    return entry.result;
  }

  async set(queryHash: string, result: object, ttlSeconds: number = 300) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return this.prisma.queryCache.upsert({
      where: { queryHash },
      update: { result, expiresAt },
      create: { queryHash, result, expiresAt },
    });
  }

  async invalidate(queryHash: string) {
    return this.prisma.queryCache.deleteMany({ where: { queryHash } });
  }

  async purgeExpired() {
    return this.prisma.queryCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
