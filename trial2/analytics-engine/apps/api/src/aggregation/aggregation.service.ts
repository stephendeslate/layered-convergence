import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupByPeriod } from '@analytics-engine/shared';

export interface AggregatedBucket {
  period: string;
  metrics: Record<string, number>;
  dimensions: Record<string, string>;
}

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTimeBucketRollups(
    tenantId: string,
    dataSourceId: string,
    metricFields: string[],
    groupBy: GroupByPeriod,
    startDate: Date,
    endDate: Date,
    dimensionFilters?: Record<string, string>,
  ): Promise<AggregatedBucket[]> {
    const truncExpression = this.getTruncExpression(groupBy);

    const dataPoints = await this.prisma.dataPoint.findMany({
      where: {
        tenantId,
        dataSourceId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    const filteredPoints = dimensionFilters
      ? dataPoints.filter((dp) => {
          const dims = dp.dimensions as Record<string, string>;
          return Object.entries(dimensionFilters).every(
            ([key, value]) => dims[key] === value,
          );
        })
      : dataPoints;

    const buckets = new Map<string, { metrics: Record<string, number[]>; dimensions: Record<string, string> }>();

    for (const dp of filteredPoints) {
      const period = this.truncateTimestamp(dp.timestamp, truncExpression);
      const dims = dp.dimensions as Record<string, string>;
      const mets = dp.metrics as Record<string, number>;

      const dimKey = Object.entries(dims)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('|');
      const bucketKey = `${period}::${dimKey}`;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, { metrics: {}, dimensions: dims });
      }

      const bucket = buckets.get(bucketKey)!;
      for (const field of metricFields) {
        if (mets[field] !== undefined) {
          if (!bucket.metrics[field]) {
            bucket.metrics[field] = [];
          }
          bucket.metrics[field].push(Number(mets[field]));
        }
      }
    }

    const result: AggregatedBucket[] = [];
    for (const [key, bucket] of buckets) {
      const period = key.split('::')[0];
      const aggregated: Record<string, number> = {};
      for (const [field, values] of Object.entries(bucket.metrics)) {
        aggregated[field] = values.reduce((a, b) => a + b, 0);
      }
      result.push({ period, metrics: aggregated, dimensions: bucket.dimensions });
    }

    result.sort((a, b) => a.period.localeCompare(b.period));

    this.logger.debug(
      `Aggregated ${filteredPoints.length} points into ${result.length} buckets (${groupBy})`,
    );

    return result;
  }

  private getTruncExpression(groupBy: GroupByPeriod): string {
    switch (groupBy) {
      case GroupByPeriod.HOUR:
        return 'hour';
      case GroupByPeriod.DAY:
        return 'day';
      case GroupByPeriod.WEEK:
        return 'week';
      default: {
        const exhaustiveCheck: never = groupBy;
        throw new Error(`Unknown group by period: ${exhaustiveCheck}`);
      }
    }
  }

  private truncateTimestamp(date: Date, truncTo: string): string {
    const d = new Date(date);
    switch (truncTo) {
      case 'hour':
        d.setMinutes(0, 0, 0);
        return d.toISOString();
      case 'day':
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      case 'week': {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      }
      default:
        return d.toISOString();
    }
  }
}
