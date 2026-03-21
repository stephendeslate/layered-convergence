import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AggregationService } from '../aggregation/aggregation.service';
import { QueryCacheService } from '../cache/cache.service';
import {
  QueryParams,
  QueryResult,
  GroupByPeriod,
  FilterOperator,
  QueryFilter,
} from '@analytics-engine/shared';

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aggregationService: AggregationService,
    private readonly cacheService: QueryCacheService,
  ) {}

  async execute(tenantId: string, params: QueryParams): Promise<QueryResult> {
    const start = Date.now();

    const cacheKey = this.cacheService.generateCacheKey(tenantId, params as unknown as Record<string, unknown>);
    const cached = await this.cacheService.get<QueryResult>(cacheKey);
    if (cached) {
      return {
        ...cached,
        meta: { ...cached.meta, cached: true, queryTimeMs: Date.now() - start },
      };
    }

    let result: QueryResult;
    if (params.groupBy) {
      result = await this.executeAggregated(tenantId, params, start);
    } else {
      result = await this.executeRaw(tenantId, params, start);
    }

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  private async executeAggregated(
    tenantId: string,
    params: QueryParams,
    startTime: number,
  ): Promise<QueryResult> {
    const startDate = params.dateRange
      ? new Date(params.dateRange.start)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.dateRange
      ? new Date(params.dateRange.end)
      : new Date();

    const dimensionFilters: Record<string, string> = {};
    if (params.filters) {
      for (const filter of params.filters) {
        if (filter.operator === FilterOperator.EQ && typeof filter.value === 'string') {
          dimensionFilters[filter.field] = filter.value;
        }
      }
    }

    const buckets = await this.aggregationService.getTimeBucketRollups(
      tenantId,
      params.dataSourceId,
      params.metrics,
      params.groupBy!,
      startDate,
      endDate,
      Object.keys(dimensionFilters).length > 0 ? dimensionFilters : undefined,
    );

    const data = buckets.map((bucket) => ({
      period: bucket.period,
      ...bucket.metrics,
      ...bucket.dimensions,
    }));

    const limited = params.limit ? data.slice(0, params.limit) : data;

    return {
      data: limited,
      meta: {
        totalRows: data.length,
        cached: false,
        queryTimeMs: Date.now() - startTime,
      },
    };
  }

  private async executeRaw(
    tenantId: string,
    params: QueryParams,
    startTime: number,
  ): Promise<QueryResult> {
    const where: Record<string, unknown> = {
      tenantId,
      dataSourceId: params.dataSourceId,
    };

    if (params.dateRange) {
      where.timestamp = {
        gte: new Date(params.dateRange.start),
        lte: new Date(params.dateRange.end),
      };
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params.limit ?? 1000,
    });

    let filtered = dataPoints;
    if (params.filters && params.filters.length > 0) {
      filtered = dataPoints.filter((dp) => {
        const dims = dp.dimensions as Record<string, unknown>;
        const mets = dp.metrics as Record<string, unknown>;
        const combined = { ...dims, ...mets };

        return params.filters!.every((filter) =>
          this.evaluateFilter(combined, filter),
        );
      });
    }

    const data = filtered.map((dp) => {
      const dims = dp.dimensions as Record<string, unknown>;
      const mets = dp.metrics as Record<string, unknown>;
      const result: Record<string, unknown> = {
        timestamp: dp.timestamp.toISOString(),
      };

      if (params.dimensions) {
        for (const dim of params.dimensions) {
          result[dim] = dims[dim];
        }
      } else {
        Object.assign(result, dims);
      }

      for (const metric of params.metrics) {
        result[metric] = mets[metric];
      }

      return result;
    });

    this.logger.debug(
      `Query returned ${data.length} results in ${Date.now() - startTime}ms`,
    );

    return {
      data,
      meta: {
        totalRows: data.length,
        cached: false,
        queryTimeMs: Date.now() - startTime,
      },
    };
  }

  private evaluateFilter(
    record: Record<string, unknown>,
    filter: QueryFilter,
  ): boolean {
    const value = record[filter.field];
    if (value === undefined || value === null) return false;

    switch (filter.operator) {
      case FilterOperator.EQ:
        return value === filter.value;
      case FilterOperator.NOT_EQ:
        return value !== filter.value;
      case FilterOperator.GT:
        return Number(value) > Number(filter.value);
      case FilterOperator.GTE:
        return Number(value) >= Number(filter.value);
      case FilterOperator.LT:
        return Number(value) < Number(filter.value);
      case FilterOperator.LTE:
        return Number(value) <= Number(filter.value);
      case FilterOperator.CONTAINS:
        return String(value).includes(String(filter.value));
      case FilterOperator.NOT_CONTAINS:
        return !String(value).includes(String(filter.value));
      default:
        return true;
    }
  }
}
