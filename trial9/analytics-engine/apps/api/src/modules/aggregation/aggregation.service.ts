import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface AggregatedBucket {
  bucket: string;
  count: number;
  metrics: Record<string, number>;
}

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate data points into time buckets.
   * Computes count and sum of all numeric metric values per bucket.
   */
  async aggregate(
    tenantId: string,
    dataSourceId: string,
    startDate: Date,
    endDate: Date,
    bucket: 'hourly' | 'daily' | 'weekly',
  ): Promise<AggregatedBucket[]> {
    const dataPoints = await this.prisma.dataPoint.findMany({
      where: {
        tenantId,
        dataSourceId,
        timestamp: { gte: startDate, lte: endDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    const buckets = new Map<string, { count: number; metrics: Record<string, number> }>();

    for (const point of dataPoints) {
      const key = this.getBucketKey(point.timestamp, bucket);
      const existing = buckets.get(key) ?? { count: 0, metrics: {} };
      existing.count++;

      const metrics = point.metrics as Record<string, unknown>;
      for (const [metricName, value] of Object.entries(metrics)) {
        if (typeof value === 'number') {
          existing.metrics[metricName] = (existing.metrics[metricName] ?? 0) + value;
        }
      }

      buckets.set(key, existing);
    }

    const result: AggregatedBucket[] = [];
    for (const [bucketKey, data] of buckets.entries()) {
      result.push({ bucket: bucketKey, ...data });
    }

    this.logger.debug(`Aggregated ${dataPoints.length} points into ${result.length} ${bucket} buckets`);
    return result;
  }

  private getBucketKey(date: Date, bucket: 'hourly' | 'daily' | 'weekly'): string {
    const d = new Date(date);
    switch (bucket) {
      case 'hourly':
        d.setMinutes(0, 0, 0);
        return d.toISOString();
      case 'daily':
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
      case 'weekly': {
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
      }
    }
  }
}
