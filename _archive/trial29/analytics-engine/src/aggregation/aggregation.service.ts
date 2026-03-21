import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AggregationService {
  constructor(private readonly prisma: PrismaService) {}

  async aggregateByTimeBucket(
    tenantId: string,
    dataSourceId: string,
    bucket: 'hourly' | 'daily' | 'weekly',
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { tenantId, dataSourceId };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    const buckets = new Map<string, any[]>();

    for (const dp of dataPoints) {
      const key = this.getBucketKey(new Date(dp.timestamp), bucket);
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key)!.push(dp);
    }

    const result: Array<{ bucket: string; count: number; metrics: Record<string, number> }> = [];

    for (const [key, points] of buckets) {
      const allKeys = new Set<string>();
      for (const dp of points) {
        const m = dp.metrics as Record<string, any>;
        for (const k of Object.keys(m)) {
          allKeys.add(k);
        }
      }

      const aggregated: Record<string, number> = {};
      for (const metricKey of allKeys) {
        const values = points
          .map((dp) => (dp.metrics as Record<string, any>)[metricKey])
          .filter((v) => typeof v === 'number');
        aggregated[metricKey] = values.reduce((a, b) => a + b, 0);
      }

      result.push({
        bucket: key,
        count: points.length,
        metrics: aggregated,
      });
    }

    return result;
  }

  private getBucketKey(date: Date, bucket: 'hourly' | 'daily' | 'weekly'): string {
    switch (bucket) {
      case 'hourly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00`;
      case 'daily':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      case 'weekly': {
        const day = date.getDay();
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - day);
        return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      }
    }
  }
}
