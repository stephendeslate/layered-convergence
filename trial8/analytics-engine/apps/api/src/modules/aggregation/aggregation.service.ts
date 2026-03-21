import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { fromJsonValue } from '../../common/helpers/json.helper';
import { startOfHour, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

interface DataPointMetrics {
  [key: string]: number;
}

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate data points into time-bucketed summaries.
   * Reads raw data points and groups them by the specified time bucket.
   */
  async aggregate(
    tenantId: string,
    dataSourceId: string,
    bucket: string,
    startDate?: string,
    endDate?: string,
    metric?: string,
  ) {
    this.logger.log(`Aggregating ${bucket} data for source ${dataSourceId}`);

    const where: Record<string, unknown> = {
      tenantId,
      dataSourceId,
    };

    if (startDate || endDate) {
      const timestamp: Record<string, Date> = {};
      if (startDate) timestamp.gte = new Date(startDate);
      if (endDate) timestamp.lte = new Date(endDate);
      where.timestamp = timestamp;
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    const bucketFn = this.getBucketFn(bucket);
    const buckets = new Map<string, { sum: Record<string, number>; count: number }>();

    for (const point of dataPoints) {
      const bucketKey = bucketFn(point.timestamp).toISOString();
      const metrics = fromJsonValue<DataPointMetrics>(point.metrics);

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, { sum: {}, count: 0 });
      }

      const bucket = buckets.get(bucketKey)!;
      bucket.count++;

      for (const [key, value] of Object.entries(metrics)) {
        if (metric && key !== metric) continue;
        if (typeof value === 'number') {
          bucket.sum[key] = (bucket.sum[key] ?? 0) + value;
        }
      }
    }

    return Array.from(buckets.entries()).map(([timestamp, { sum, count }]) => ({
      timestamp,
      count,
      metrics: sum,
    }));
  }

  /**
   * Run aggregation as a background job for a data source.
   * This is triggered by BullMQ after new data ingestion.
   */
  async runAggregationJob(dataSourceId: string) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
    });

    this.logger.log(`Running aggregation job for ${dataSource.name}`);

    // findFirst justified: no data points may exist yet for a newly created source,
    // returning null indicates no aggregation is needed
    const latestPoint = await this.prisma.dataPoint.findFirst({
      where: { dataSourceId },
      orderBy: { timestamp: 'desc' },
    });

    if (!latestPoint) {
      this.logger.log(`No data points found for source ${dataSourceId}, skipping aggregation`);
      return { aggregated: 0 };
    }

    const result = await this.aggregate(
      dataSource.tenantId,
      dataSourceId,
      'hour',
    );

    return { aggregated: result.length };
  }

  private getBucketFn(bucket: string): (date: Date) => Date {
    switch (bucket) {
      case 'hour': return startOfHour;
      case 'day': return startOfDay;
      case 'week': return startOfWeek;
      case 'month': return startOfMonth;
      default: return startOfDay;
    }
  }
}
