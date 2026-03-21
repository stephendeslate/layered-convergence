import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createHash } from 'crypto';

@Injectable()
export class QueryCacheService {
  constructor(private readonly prisma: PrismaService) {}

  generateHash(query: Record<string, any>): string {
    return createHash('sha256')
      .update(JSON.stringify(query))
      .digest('hex');
  }

  async get(queryHash: string) {
    // findFirst: queryHash is unique — at most one result
    const cached = await this.prisma.queryCache.findFirst({
      where: { queryHash },
    });

    if (!cached) {
      return null;
    }

    if (new Date() > cached.expiresAt) {
      await this.prisma.queryCache.delete({ where: { id: cached.id } });
      return null;
    }

    return cached.result;
  }

  async set(
    queryHash: string,
    result: Record<string, any>,
    ttlSeconds: number = 300,
  ) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // findFirst: queryHash is unique — at most one result
    const existing = await this.prisma.queryCache.findFirst({
      where: { queryHash },
    });

    if (existing) {
      return this.prisma.queryCache.update({
        where: { id: existing.id },
        data: { result, expiresAt },
      });
    }

    return this.prisma.queryCache.create({
      data: { queryHash, result, expiresAt },
    });
  }

  async invalidate(queryHash: string) {
    // findFirst: queryHash is unique — at most one result
    const existing = await this.prisma.queryCache.findFirst({
      where: { queryHash },
    });
    if (existing) {
      await this.prisma.queryCache.delete({ where: { id: existing.id } });
    }
  }

  async invalidateAll() {
    await this.prisma.queryCache.deleteMany();
  }
}
