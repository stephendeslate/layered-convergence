import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryDataPointsDto } from './dto/query-data-points.dto.js';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async query(tenantId: string, dto: QueryDataPointsDto) {
    const { dataSourceId, startDate, endDate, dimensions } = dto;

    const where: Record<string, unknown> = {
      tenantId,
      dataSourceId,
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (dimensions && Object.keys(dimensions).length > 0) {
      where.dimensions = { path: Object.keys(dimensions), equals: dimensions };
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    if (dto.groupBy) {
      return this.groupByTimeBucket(dataPoints, dto.groupBy);
    }

    return dataPoints;
  }

  private groupByTimeBucket(
    dataPoints: Array<{ timestamp: Date; metrics: unknown }>,
    groupBy: string,
  ) {
    const buckets = new Map<string, { metrics: Record<string, number>; count: number }>();

    for (const point of dataPoints) {
      const bucketKey = this.getBucketKey(point.timestamp, groupBy);
      const existing = buckets.get(bucketKey);
      // type assertion justified: metrics is typed as Json in Prisma but we know it's a record
      const metrics = point.metrics as Record<string, number>;

      if (existing) {
        for (const [key, value] of Object.entries(metrics)) {
          existing.metrics[key] = (existing.metrics[key] ?? 0) + value;
        }
        existing.count++;
      } else {
        buckets.set(bucketKey, { metrics: { ...metrics }, count: 1 });
      }
    }

    return Array.from(buckets.entries()).map(([bucket, data]) => ({
      bucket,
      ...data,
    }));
  }

  private getBucketKey(timestamp: Date, groupBy: string): string {
    switch (groupBy) {
      case 'hour':
        return `${timestamp.toISOString().slice(0, 13)}:00:00.000Z`;
      case 'day':
        return timestamp.toISOString().slice(0, 10);
      case 'week': {
        const d = new Date(timestamp);
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().slice(0, 10);
      }
      case 'month':
        return timestamp.toISOString().slice(0, 7);
      default:
        return timestamp.toISOString().slice(0, 10);
    }
  }
}
