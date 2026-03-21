import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { fromJsonField } from '../../common/helpers/json-field.helper';

interface AggregatedBucket {
  period: string;
  metrics: Record<string, number>;
  count: number;
}

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate data points into time-bucketed summaries.
   * Admin endpoint for triggering aggregation on demand.
   */
  async aggregate(
    dataSourceId: string,
    granularity: 'hour' | 'day' | 'week' = 'day',
    startDate?: Date,
    endDate?: Date,
  ): Promise<AggregatedBucket[]> {
    const where: Record<string, unknown> = { dataSourceId };
    if (startDate || endDate) {
      where['timestamp'] = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    const buckets = new Map<string, { metrics: Record<string, number>; count: number }>();

    for (const point of dataPoints) {
      const period = this.getBucketKey(point.timestamp, granularity);
      const existing = buckets.get(period) ?? { metrics: {}, count: 0 };
      const pointMetrics = fromJsonField<Record<string, number>>(point.metrics);

      for (const [key, value] of Object.entries(pointMetrics)) {
        existing.metrics[key] = (existing.metrics[key] ?? 0) + value;
      }
      existing.count += 1;
      buckets.set(period, existing);
    }

    this.logger.log(
      `Aggregated ${dataPoints.length} points into ${buckets.size} ${granularity} buckets for data source ${dataSourceId}`,
    );

    return Array.from(buckets.entries()).map(([period, data]) => ({
      period,
      metrics: data.metrics,
      count: data.count,
    }));
  }

  /**
   * Admin status endpoint — returns aggregation statistics.
   */
  async getStatus(dataSourceId: string) {
    const count = await this.prisma.dataPoint.count({ where: { dataSourceId } });
    const latest = await this.prisma.dataPoint.findFirst({
      where: { dataSourceId },
      orderBy: { timestamp: 'desc' },
    });

    return {
      dataSourceId,
      totalDataPoints: count,
      latestTimestamp: latest?.timestamp ?? null,
    };
  }

  private getBucketKey(date: Date, granularity: 'hour' | 'day' | 'week'): string {
    switch (granularity) {
      case 'hour':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00`;
      case 'day':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      case 'week': {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return `${startOfWeek.getFullYear()}-W${String(Math.ceil((startOfWeek.getDate()) / 7)).padStart(2, '0')}`;
      }
    }
  }
}
