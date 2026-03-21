import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class QueryCacheService {
  constructor(private prisma: PrismaService) {}

  async get(query: string) {
    const queryHash = this.hashQuery(query);
    const cached = await this.prisma.queryCache.findUnique({
      where: { queryHash },
    });

    if (!cached) return null;
    if (new Date() > cached.expiresAt) {
      await this.prisma.queryCache.delete({ where: { queryHash } });
      return null;
    }

    return cached.result;
  }

  async set(query: string, result: any, ttlSeconds: number = 300) {
    const queryHash = this.hashQuery(query);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return this.prisma.queryCache.upsert({
      where: { queryHash },
      update: { result, expiresAt },
      create: { queryHash, result, expiresAt },
    });
  }

  async invalidate(query: string) {
    const queryHash = this.hashQuery(query);
    try {
      await this.prisma.queryCache.delete({ where: { queryHash } });
    } catch {
      // ignore if not found
    }
  }

  async clearExpired() {
    await this.prisma.queryCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  private hashQuery(query: string): string {
    return createHash('sha256').update(query).digest('hex');
  }
}
