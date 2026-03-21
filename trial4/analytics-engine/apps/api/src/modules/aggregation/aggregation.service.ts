import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AggregateQueryDto } from './aggregation.dto';

@Injectable()
export class AggregationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate data points by time bucket for a given tenant and data source.
   * Groups metrics by the specified interval (hourly, daily, weekly).
   */
  async aggregate(tenantId: string, dto: AggregateQueryDto) {
    const dataPoints = await this.prisma.dataPoint.findMany({
      where: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        timestamp: {
          gte: new Date(dto.startDate),
          lte: new Date(dto.endDate),
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    const buckets = new Map<string, { count: number; metrics: Record<string, number> }>();

    for (const point of dataPoints) {
      const bucketKey = this.getBucketKey(point.timestamp, dto.interval);
      const existing = buckets.get(bucketKey) ?? { count: 0, metrics: {} };

      existing.count += 1;
      const pointMetrics = point.metrics as Record<string, number>;
      for (const [key, value] of Object.entries(pointMetrics)) {
        if (typeof value === 'number') {
          existing.metrics[key] = (existing.metrics[key] ?? 0) + value;
        }
      }

      buckets.set(bucketKey, existing);
    }

    return Array.from(buckets.entries()).map(([bucket, data]) => ({
      bucket,
      count: data.count,
      metrics: data.metrics,
    }));
  }

  /**
   * Get KPI summary for a tenant: total data points, active data sources, last sync time.
   */
  async getKpiSummary(tenantId: string) {
    const [totalPoints, activeSources, lastSync] = await Promise.all([
      this.prisma.dataPoint.count({ where: { tenantId } }),
      this.prisma.dataSource.count({ where: { tenantId } }),
      // [JUSTIFIED:findFirst] most recent sync — null means no syncs completed yet
      this.prisma.syncRun.findFirst({
        where: {
          dataSource: { tenantId },
          status: 'COMPLETED',
        },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    return {
      totalDataPoints: totalPoints,
      activeDataSources: activeSources,
      lastSyncAt: lastSync?.completedAt ?? null,
    };
  }

  private getBucketKey(timestamp: Date, interval: string): string {
    const d = new Date(timestamp);
    switch (interval) {
      case 'hourly':
        return `${d.toISOString().slice(0, 13)}:00:00Z`;
      case 'daily':
        return d.toISOString().slice(0, 10);
      case 'weekly': {
        const dayOfWeek = d.getDay();
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - dayOfWeek);
        return weekStart.toISOString().slice(0, 10);
      }
      default:
        return d.toISOString().slice(0, 10);
    }
  }
}
