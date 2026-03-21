import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class QueryCacheService {
  constructor(private readonly prisma: PrismaService) {}

  async get(queryHash: string): Promise<unknown | null> {
    // findFirst justified: queryHash is unique but we want null instead of throw on miss
    const cached = await this.prisma.queryCache.findFirst({
      where: {
        queryHash,
        expiresAt: { gt: new Date() },
      },
    });

    return cached?.result ?? null;
  }

  async set(
    queryHash: string,
    result: unknown,
    ttlSeconds: number = 300,
  ) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return this.prisma.queryCache.upsert({
      where: { queryHash },
      create: {
        queryHash,
        // type assertion justified: result is typed as unknown but Prisma expects InputJsonValue
        result: result as Prisma.InputJsonValue,
        expiresAt,
      },
      update: {
        // type assertion justified: result is typed as unknown but Prisma expects InputJsonValue
        result: result as Prisma.InputJsonValue,
        expiresAt,
      },
    });
  }

  async invalidate(queryHash: string) {
    return this.prisma.queryCache.deleteMany({
      where: { queryHash },
    });
  }

  async invalidateExpired() {
    return this.prisma.queryCache.deleteMany({
      where: {
        expiresAt: { lte: new Date() },
      },
    });
  }
}
