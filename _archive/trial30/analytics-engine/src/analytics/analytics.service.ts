import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';

export interface AggregatedResult {
  period: string;
  metrics: Record<string, number>;
  dimensions?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async query(dto: QueryAnalyticsDto): Promise<AggregatedResult[]> {
    const where: Record<string, unknown> = {
      dataSourceId: dto.dataSourceId,
    };

    if (dto.startDate || dto.endDate) {
      const timestamp: Record<string, Date> = {};
      if (dto.startDate) timestamp.gte = new Date(dto.startDate);
      if (dto.endDate) timestamp.lte = new Date(dto.endDate);
      where.timestamp = timestamp;
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    return this.aggregate(dataPoints, dto.granularity || 'day');
  }

  private aggregate(
    dataPoints: Array<{ timestamp: Date; metrics: unknown; dimensions: unknown }>,
    granularity: string,
  ): AggregatedResult[] {
    const buckets = new Map<string, { metrics: Record<string, number>; count: number }>();

    for (const dp of dataPoints) {
      const period = this.getBucketKey(dp.timestamp, granularity);
      const existing = buckets.get(period) || { metrics: {}, count: 0 };

      const dpMetrics = dp.metrics as Record<string, number>;
      for (const [key, value] of Object.entries(dpMetrics)) {
        if (typeof value === 'number') {
          existing.metrics[key] = (existing.metrics[key] || 0) + value;
        }
      }
      existing.count++;
      buckets.set(period, existing);
    }

    return Array.from(buckets.entries()).map(([period, data]) => ({
      period,
      metrics: data.metrics,
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
      case 'month':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }

  async getKpi(dataSourceId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dataPoints = await this.prisma.dataPoint.findMany({
      where: {
        dataSourceId,
        timestamp: { gte: thirtyDaysAgo },
      },
    });

    const totalMetrics: Record<string, number> = {};
    for (const dp of dataPoints) {
      const dpMetrics = dp.metrics as Record<string, number>;
      for (const [key, value] of Object.entries(dpMetrics)) {
        if (typeof value === 'number') {
          totalMetrics[key] = (totalMetrics[key] || 0) + value;
        }
      }
    }

    return {
      dataSourceId,
      period: '30d',
      totalDataPoints: dataPoints.length,
      metrics: totalMetrics,
    };
  }
}
