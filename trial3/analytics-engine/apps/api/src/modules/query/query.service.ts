import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface QueryRequest {
  dataSourceId: string;
  dimensions?: string[];
  metrics?: string[];
  timeRange?: { start: Date; end: Date };
  groupBy?: string;
  limit?: number;
}

export interface QueryResult {
  data: Record<string, unknown>[];
  meta: {
    rowCount: number;
    cacheHit: boolean;
    executionMs: number;
  };
}

@Injectable()
export class QueryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(tenantId: string, query: QueryRequest): Promise<QueryResult> {
    const startTime = Date.now();

    // Verify data source belongs to tenant
    await this.prisma.dataSource.findFirstOrThrow({
      where: { id: query.dataSourceId, tenantId },
    });

    // Check query cache
    const cacheKey = this.buildCacheKey(tenantId, query);
    const cached = await this.checkCache(cacheKey);
    if (cached) {
      return {
        data: cached as Record<string, unknown>[],
        meta: { rowCount: (cached as unknown[]).length, cacheHit: true, executionMs: Date.now() - startTime },
      };
    }

    // Build where clause
    const where: Record<string, unknown> = {
      dataSourceId: query.dataSourceId,
      tenantId,
    };

    if (query.timeRange) {
      where.timestamp = {
        gte: query.timeRange.start,
        lte: query.timeRange.end,
      };
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: query.limit ?? 1000,
    });

    const result = dataPoints.map((dp) => ({
      timestamp: dp.timestamp,
      dimensions: dp.dimensions,
      metrics: dp.metrics,
    }));

    // Cache result (5 minute TTL)
    await this.setCache(cacheKey, result);

    return {
      data: result as Record<string, unknown>[],
      meta: {
        rowCount: result.length,
        cacheHit: false,
        executionMs: Date.now() - startTime,
      },
    };
  }

  private buildCacheKey(tenantId: string, query: QueryRequest): string {
    const raw = JSON.stringify({ tenantId, ...query });
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `query:${hash.toString(36)}`;
  }

  private async checkCache(key: string): Promise<unknown | null> {
    const entry = await this.prisma.queryCache.findUnique({
      where: { queryHash: key },
    });

    if (!entry || entry.expiresAt < new Date()) {
      return null;
    }

    return entry.result;
  }

  private async setCache(key: string, result: unknown): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.queryCache.upsert({
      where: { queryHash: key },
      create: { queryHash: key, result: result as never, expiresAt },
      update: { result: result as never, expiresAt },
    });
  }
}
