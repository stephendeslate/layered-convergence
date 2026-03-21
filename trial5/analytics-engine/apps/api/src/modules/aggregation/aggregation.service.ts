import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async aggregateByTenant(tenantId: string, granularity: 'hour' | 'day' | 'week' = 'day') {
    const dataSources = await this.prisma.dataSource.findMany({
      where: { tenantId },
    });

    const results = [];

    for (const ds of dataSources) {
      const dataPoints = await this.prisma.dataPoint.findMany({
        where: { dataSourceId: ds.id, tenantId },
        orderBy: { timestamp: 'asc' },
      });

      const buckets = this.bucketize(dataPoints, granularity);
      results.push({
        dataSourceId: ds.id,
        dataSourceName: ds.name,
        buckets,
      });
    }

    this.logger.log(`Aggregated data for tenant ${tenantId}: ${results.length} data sources`);
    return results;
  }

  async runAggregationJob() {
    const tenants = await this.prisma.tenant.findMany();
    const results = [];

    for (const tenant of tenants) {
      const result = await this.aggregateByTenant(tenant.id);
      results.push({ tenantId: tenant.id, dataSources: result.length });
    }

    this.logger.log(`Aggregation job completed for ${tenants.length} tenants`);
    return results;
  }

  private bucketize(
    dataPoints: Array<{ timestamp: Date; dimensions: unknown; metrics: unknown }>,
    granularity: string,
  ) {
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
