import { Injectable, Logger, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { QueryService } from '../query/query.service';

/**
 * Cache invalidation service.
 * Manages query cache lifecycle and pre-warming.
 * Per SRS-3 sections 5.4.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly queryService: QueryService,
    @Inject('BULLMQ_QUEUE_CACHE_INVALIDATION')
    private readonly cacheInvalidationQueue: Queue,
  ) {}

  /**
   * Invalidate all query caches that depend on a given data source.
   * Called after sync completion.
   */
  async invalidateForDataSource(
    dataSourceId: string,
    tenantId: string,
  ): Promise<number> {
    // Find all widgets using this data source
    const widgets = await this.prisma.widget.findMany({
      where: { dataSourceId, tenantId },
      select: { id: true, dashboardId: true },
    });

    if (widgets.length === 0) return 0;

    // Invalidate cache via QueryService
    const deleted = await this.queryService.invalidateCache(
      tenantId,
      widgets.map((w) => w.id),
    );

    this.logger.log(
      `Invalidated ${deleted} cache entries for data source ${dataSourceId}`,
    );

    return deleted;
  }

  /**
   * Invalidate all widget query caches for a dashboard.
   */
  async invalidateForDashboard(
    dashboardId: string,
    tenantId: string,
  ): Promise<number> {
    const widgets = await this.prisma.widget.findMany({
      where: { dashboardId, tenantId },
      select: { id: true },
    });

    if (widgets.length === 0) return 0;

    const deleted = await this.queryService.invalidateCache(
      tenantId,
      widgets.map((w) => w.id),
    );

    this.logger.log(
      `Invalidated ${deleted} cache entries for dashboard ${dashboardId}`,
    );

    return deleted;
  }

  /**
   * Pre-execute queries for all widgets on a dashboard to warm the cache.
   * Useful after publishing or after a sync completes.
   */
  async warmCache(dashboardId: string, tenantId: string): Promise<number> {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) return 0;

    // Get tenant tier for cache TTL
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { tier: true },
    });

    let warmed = 0;

    for (const widget of dashboard.widgets) {
      try {
        const metricFields = widget.metricFields as {
          field: string;
          aggregation: string;
        }[];

        await this.queryService.executeQuery(
          {
            widgetId: widget.id,
            dataSourceId: widget.dataSourceId,
            tenantId,
            dimensionField: widget.dimensionField,
            metricFields,
            dateRange: {
              preset: widget.dateRangePreset,
              start: widget.dateRangeStart ?? undefined,
              end: widget.dateRangeEnd ?? undefined,
            },
            groupingPeriod: widget.groupingPeriod,
          },
          tenant?.tier ?? 'FREE',
        );
        warmed++;
      } catch (err) {
        this.logger.warn(
          `Failed to warm cache for widget ${widget.id}: ${err}`,
        );
      }
    }

    this.logger.log(
      `Warmed cache for ${warmed}/${dashboard.widgets.length} widgets on dashboard ${dashboardId}`,
    );

    return warmed;
  }

  /**
   * Enqueue an asynchronous cache invalidation job.
   * Used after syncs to process invalidation via BullMQ.
   */
  async enqueueInvalidation(
    dataSourceId: string,
    tenantId: string,
    widgetIds: string[],
    dashboardIds: string[],
  ): Promise<void> {
    await this.cacheInvalidationQueue.add(
      'invalidate',
      {
        dataSourceId,
        tenantId,
        widgetIds,
        dashboardIds,
      },
      {
        attempts: 1,
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    );
  }
}
