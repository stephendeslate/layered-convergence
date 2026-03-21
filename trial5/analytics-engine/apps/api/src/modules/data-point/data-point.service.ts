import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryDataPointsDto } from './dto/query-data-points.dto';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async query(dto: QueryDataPointsDto) {
    const where: Record<string, unknown> = {
      tenantId: dto.tenantId,
      dataSourceId: dto.dataSourceId,
    };

    if (dto.startDate || dto.endDate) {
      where.timestamp = {};
      if (dto.startDate) (where.timestamp as Record<string, unknown>).gte = new Date(dto.startDate);
      if (dto.endDate) (where.timestamp as Record<string, unknown>).lte = new Date(dto.endDate);
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: dto.limit ?? 1000,
    });

    return {
      data: dataPoints,
      count: dataPoints.length,
      query: { tenantId: dto.tenantId, dataSourceId: dto.dataSourceId },
    };
  }

  async ingest(tenantId: string, dataSourceId: string, points: Array<{ timestamp: string; dimensions: Record<string, unknown>; metrics: Record<string, unknown> }>) {
    const data = points.map((p) => ({
      tenantId,
      dataSourceId,
      timestamp: new Date(p.timestamp),
      dimensions: p.dimensions,
      metrics: p.metrics,
    }));

    return this.prisma.dataPoint.createMany({ data });
  }

  async getAggregated(tenantId: string, dataSourceId: string, granularity: 'hour' | 'day' | 'week') {
    // For demo purposes, return grouped data points
    const dataPoints = await this.prisma.dataPoint.findMany({
      where: { tenantId, dataSourceId },
      orderBy: { timestamp: 'asc' },
    });

    return this.aggregateByGranularity(dataPoints, granularity);
  }

  private aggregateByGranularity(dataPoints: Array<{ timestamp: Date; metrics: unknown }>, granularity: string) {
    const buckets = new Map<string, { count: number; metrics: Record<string, number> }>();

    for (const dp of dataPoints) {
      const key = this.getBucketKey(dp.timestamp, granularity);
      if (!buckets.has(key)) {
        buckets.set(key, { count: 0, metrics: {} });
      }
      const bucket = buckets.get(key)!;
      bucket.count += 1;

      const metrics = dp.metrics as Record<string, number>;
      for (const [k, v] of Object.entries(metrics)) {
        bucket.metrics[k] = (bucket.metrics[k] || 0) + (typeof v === 'number' ? v : 0);
      }
    }

    return Array.from(buckets.entries()).map(([key, value]) => ({
      bucket: key,
      count: value.count,
      metrics: value.metrics,
    }));
  }

  private getBucketKey(date: Date, granularity: string): string {
    const d = new Date(date);
    switch (granularity) {
      case 'hour':
        d.setMinutes(0, 0, 0);
        return d.toISOString();
      case 'day':
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
      case 'week': {
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
      }
      default:
        return d.toISOString().split('T')[0];
    }
  }
}
