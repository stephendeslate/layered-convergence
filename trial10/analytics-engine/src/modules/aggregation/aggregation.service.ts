import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate data points into time-bucketed summaries.
   * Supports hourly, daily, and weekly granularity.
   */
  async aggregate(
    tenantId: string,
    dataSourceId: string,
    granularity: 'hourly' | 'daily' | 'weekly',
    startDate: Date,
    endDate: Date,
  ) {
    const dataPoints = await this.prisma.dataPoint.findMany({
      where: {
        tenantId,
        dataSourceId,
        timestamp: { gte: startDate, lte: endDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    const buckets = new Map<string, { dimensions: Record<string, unknown>; metrics: Record<string, number>; count: number }>();

    for (const point of dataPoints) {
      const bucketKey = this.getBucketKey(point.timestamp, granularity);
      const existing = buckets.get(bucketKey);
      const pointMetrics = point.metrics as Record<string, number>;

      if (existing) {
        for (const [key, value] of Object.entries(pointMetrics)) {
          existing.metrics[key] = (existing.metrics[key] ?? 0) + value;
        }
        existing.count++;
      } else {
        buckets.set(bucketKey, {
          dimensions: point.dimensions as Record<string, unknown>,
          metrics: { ...pointMetrics },
          count: 1,
        });
      }
    }

    return Array.from(buckets.entries()).map(([key, value]) => ({
      bucket: key,
      granularity,
      ...value,
    }));
  }

  private getBucketKey(timestamp: Date, granularity: string): string {
    const d = new Date(timestamp);
    switch (granularity) {
      case 'hourly':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:00`;
      case 'daily':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      case 'weekly': {
        const day = d.getDay();
        const diff = d.getDate() - day;
        const weekStart = new Date(d.setDate(diff));
        return `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
      }
      default:
        return d.toISOString();
    }
  }
}
