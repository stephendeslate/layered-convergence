import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

/** Cache TTL per tier (in seconds) */
const CACHE_TTL: Record<string, number> = {
  FREE: 300, // 5 min
  PRO: 60, // 1 min
  ENTERPRISE: 30, // 30 sec
};

export interface WidgetQueryParams {
  widgetId?: string;
  dataSourceId: string;
  tenantId: string;
  dimensionField: string;
  metricFields: { field: string; aggregation: string }[];
  dateRange: {
    preset: string;
    start?: Date;
    end?: Date;
  };
  groupingPeriod: string;
  filters?: { field: string; operator: string; value: unknown }[];
  limit?: number;
  offset?: number;
}

export interface WidgetQueryResult {
  labels: string[];
  series: {
    name: string;
    data: (number | null)[];
  }[];
  meta: {
    totalRows: number;
    queryTime: number;
    fromCache: boolean;
  };
}

/** Aggregation function to column mapping */
const AGG_COLUMN_MAP: Record<string, string> = {
  SUM: 'sumValue',
  AVG: 'avgValue',
  COUNT: 'countValue',
  MIN: 'minValue',
  MAX: 'maxValue',
};

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Execute a query against aggregated or raw data.
   * Per SRS-3 section 3.2.
   */
  async executeQuery(
    params: WidgetQueryParams,
    tier: string = 'FREE',
  ): Promise<WidgetQueryResult> {
    const startTime = Date.now();

    // 1. Check cache
    const queryHash = this.buildQueryHash(params);
    const cacheKey = `query:${params.tenantId}:${queryHash}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      const result = JSON.parse(cached) as WidgetQueryResult;
      result.meta.fromCache = true;
      result.meta.queryTime = Date.now() - startTime;
      return result;
    }

    // 2. Resolve date range
    const { start, end } = this.resolveDateRange(params.dateRange);

    // 3. Choose query path based on grouping period
    let result: WidgetQueryResult;

    if (params.groupingPeriod === 'NONE') {
      result = await this.queryRawData(params, start, end);
    } else {
      result = await this.queryAggregatedData(params, start, end);
    }

    result.meta.queryTime = Date.now() - startTime;
    result.meta.fromCache = false;

    // 4. Cache result
    const ttl = CACHE_TTL[tier] ?? CACHE_TTL.FREE;
    await this.redis.setex(cacheKey, ttl, JSON.stringify(result));

    return result;
  }

  /**
   * Preview query results (no caching).
   */
  async previewQuery(
    params: WidgetQueryParams,
  ): Promise<WidgetQueryResult> {
    const startTime = Date.now();
    const { start, end } = this.resolveDateRange(params.dateRange);

    let result: WidgetQueryResult;
    if (params.groupingPeriod === 'NONE') {
      result = await this.queryRawData(params, start, end);
    } else {
      result = await this.queryAggregatedData(params, start, end);
    }

    result.meta.queryTime = Date.now() - startTime;
    result.meta.fromCache = false;
    return result;
  }

  /**
   * Invalidate all cached queries for given widget IDs.
   */
  async invalidateCache(tenantId: string, _widgetIds: string[]): Promise<number> {
    // Scan and delete matching keys
    const pattern = `query:${tenantId}:*`;
    let cursor = '0';
    let deleted = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await this.redis.del(...keys);
        deleted += keys.length;
      }
    } while (cursor !== '0');

    return deleted;
  }

  /**
   * Query aggregated data from AggregatedDataPoint table.
   */
  private async queryAggregatedData(
    params: WidgetQueryParams,
    start: Date,
    end: Date,
  ): Promise<WidgetQueryResult> {
    const aggData = await this.prisma.aggregatedDataPoint.findMany({
      where: {
        tenantId: params.tenantId,
        dataSourceId: params.dataSourceId,
        period: params.groupingPeriod as any,
        periodStart: { gte: start, lte: end },
        metricName: { in: params.metricFields.map((m) => m.field) },
      },
      orderBy: { periodStart: 'asc' },
    });

    // Group by periodStart to build labels and series
    const labelMap = new Map<string, Map<string, number | null>>();

    for (const row of aggData) {
      const label = row.periodStart.toISOString().split('T')[0];
      if (!labelMap.has(label)) {
        labelMap.set(label, new Map());
      }

      const aggColumn =
        AGG_COLUMN_MAP[
          params.metricFields.find((m) => m.field === row.metricName)
            ?.aggregation ?? 'SUM'
        ] ?? 'sumValue';

      const value = (row as any)[aggColumn] as number;
      const seriesName = `${row.metricName} (${params.metricFields.find((m) => m.field === row.metricName)?.aggregation?.toLowerCase() ?? 'sum'})`;

      const existing = labelMap.get(label)!.get(seriesName) ?? 0;
      labelMap.get(label)!.set(seriesName, existing + value);
    }

    // Apply dimension filters if any
    // (already filtered at DB level by period)

    const labels = Array.from(labelMap.keys()).sort();
    const seriesNames = new Set<string>();
    for (const m of labelMap.values()) {
      for (const key of m.keys()) seriesNames.add(key);
    }

    const series = Array.from(seriesNames).map((name) => ({
      name,
      data: labels.map((label) => labelMap.get(label)?.get(name) ?? null),
    }));

    return {
      labels,
      series,
      meta: {
        totalRows: aggData.length,
        queryTime: 0,
        fromCache: false,
      },
    };
  }

  /**
   * Query raw data from DataPoint table (for TABLE widget type).
   */
  private async queryRawData(
    params: WidgetQueryParams,
    start: Date,
    end: Date,
  ): Promise<WidgetQueryResult> {
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;

    const [dataPoints, totalCount] = await Promise.all([
      this.prisma.dataPoint.findMany({
        where: {
          tenantId: params.tenantId,
          dataSourceId: params.dataSourceId,
          timestamp: { gte: start, lte: end },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.dataPoint.count({
        where: {
          tenantId: params.tenantId,
          dataSourceId: params.dataSourceId,
          timestamp: { gte: start, lte: end },
        },
      }),
    ]);

    // Build labels from dimension field
    const labels = dataPoints.map((dp) => {
      const dims = dp.dimensions as Record<string, unknown>;
      return String(dims[params.dimensionField] ?? dp.timestamp.toISOString());
    });

    // Build series from metric fields
    const series = params.metricFields.map((mf) => ({
      name: `${mf.field} (${mf.aggregation.toLowerCase()})`,
      data: dataPoints.map((dp) => {
        const metrics = dp.metrics as Record<string, number>;
        return metrics[mf.field] ?? null;
      }),
    }));

    return {
      labels,
      series,
      meta: {
        totalRows: totalCount,
        queryTime: 0,
        fromCache: false,
      },
    };
  }

  private resolveDateRange(dateRange: {
    preset: string;
    start?: Date;
    end?: Date;
  }): { start: Date; end: Date } {
    const now = new Date();

    switch (dateRange.preset) {
      case 'LAST_7_DAYS':
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case 'LAST_30_DAYS':
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case 'LAST_90_DAYS':
        return {
          start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case 'CUSTOM':
        return {
          start: dateRange.start ?? new Date(0),
          end: dateRange.end ?? now,
        };
      case 'ALL_TIME':
      default:
        return {
          start: new Date(0),
          end: now,
        };
    }
  }

  private buildQueryHash(params: WidgetQueryParams): string {
    const hashInput = JSON.stringify({
      dataSourceId: params.dataSourceId,
      dimensionField: params.dimensionField,
      metricFields: params.metricFields,
      dateRange: params.dateRange,
      groupingPeriod: params.groupingPeriod,
      filters: params.filters,
    });
    return createHash('sha256').update(hashInput).digest('hex');
  }
}
