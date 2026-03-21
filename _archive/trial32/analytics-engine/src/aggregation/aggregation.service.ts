import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TimeBucket } from './dto/aggregation-query.dto.js';

@Injectable()
export class AggregationService {
  constructor(private readonly prisma: PrismaService) {}

  async aggregate(
    tenantId: string,
    dataSourceId: string,
    bucket: TimeBucket,
    startDate?: string,
    endDate?: string,
    metricKey?: string,
  ) {
    const where: any = { tenantId, dataSourceId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    return this.bucketize(dataPoints, bucket, metricKey);
  }

  private bucketize(dataPoints: any[], bucket: TimeBucket, metricKey?: string) {
    const buckets = new Map<string, any[]>();

    for (const dp of dataPoints) {
      const key = this.getBucketKey(new Date(dp.timestamp as string), bucket);
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key)!.push(dp);
    }

    const result: Array<{ bucket: string; metrics: Record<string, number> }> = [];

    for (const [bucketKey, points] of buckets) {
      const aggregated = this.sumMetrics(points, metricKey);
      result.push({ bucket: bucketKey, metrics: aggregated });
    }

    return result;
  }

  private getBucketKey(date: Date, bucket: TimeBucket): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');

    switch (bucket) {
      case TimeBucket.HOURLY:
        return `${year}-${month}-${day}T${hour}:00`;
      case TimeBucket.DAILY:
        return `${year}-${month}-${day}`;
      case TimeBucket.WEEKLY: {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const wy = startOfWeek.getFullYear();
        const wm = String(startOfWeek.getMonth() + 1).padStart(2, '0');
        const wd = String(startOfWeek.getDate()).padStart(2, '0');
        return `${wy}-${wm}-${wd}`;
      }
    }
  }

  private sumMetrics(
    dataPoints: any[],
    metricKey?: string,
  ): Record<string, number> {
    const result: Record<string, number> = {};

    for (const dp of dataPoints) {
      const metrics = dp.metrics as Record<string, any>;
      for (const [key, value] of Object.entries(metrics)) {
        if (metricKey && key !== metricKey) {
          continue;
        }
        if (typeof value === 'number') {
          result[key] = (result[key] ?? 0) + value;
        }
      }
    }

    return result;
  }
}
