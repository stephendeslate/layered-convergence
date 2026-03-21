import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Period = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

const PERIODS: Period[] = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'];

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Roll up raw DataPoints into time-bucketed aggregated summaries.
   * Per SRS-3 section 2.2.
   */
  async aggregateDataPoints(
    dataSourceId: string,
    tenantId: string,
    timestampRange: { from: Date; to: Date },
  ): Promise<void> {
    // Get field mappings for this data source
    const fieldMappings = await this.prisma.fieldMapping.findMany({
      where: { dataSourceId },
    });

    const metricFields = fieldMappings.filter(
      (f) => f.fieldRole === 'METRIC',
    );
    const dimensionFields = fieldMappings.filter(
      (f) => f.fieldRole === 'DIMENSION',
    );

    if (metricFields.length === 0) {
      this.logger.warn(
        `No metric fields for data source ${dataSourceId}, skipping aggregation`,
      );
      return;
    }

    for (const period of PERIODS) {
      // Query raw data points in the affected time range
      const dataPoints = await this.prisma.dataPoint.findMany({
        where: {
          dataSourceId,
          tenantId,
          timestamp: {
            gte: timestampRange.from,
            lte: timestampRange.to,
          },
        },
      });

      if (dataPoints.length === 0) continue;

      // Group by (periodStart, dimensionKey)
      const buckets = new Map<
        string,
        Array<{ dimensions: Record<string, unknown>; metrics: Record<string, number> }>
      >();

      for (const dp of dataPoints) {
        const periodStart = this.truncateToPeriod(dp.timestamp, period);
        const dimensionKey = this.buildDimensionKey(
          dp.dimensions as Record<string, unknown>,
          dimensionFields,
        );
        const bucketKey = `${periodStart.toISOString()}|${dimensionKey}`;

        if (!buckets.has(bucketKey)) {
          buckets.set(bucketKey, []);
        }
        buckets.get(bucketKey)!.push({
          dimensions: dp.dimensions as Record<string, unknown>,
          metrics: dp.metrics as Record<string, number>,
        });
      }

      // For each bucket, compute aggregations per metric
      for (const [bucketKey, points] of buckets) {
        const separatorIndex = bucketKey.indexOf('|');
        const periodStartStr = bucketKey.substring(0, separatorIndex);
        const dimensionKey = bucketKey.substring(separatorIndex + 1);
        const periodStart = new Date(periodStartStr);

        for (const metric of metricFields) {
          const values = points
            .map((p) => p.metrics[metric.targetField])
            .filter(
              (v): v is number => v !== undefined && v !== null && !isNaN(v),
            );

          if (values.length === 0) continue;

          const sumValue = values.reduce((a, b) => a + b, 0);
          const avgValue = sumValue / values.length;
          const countValue = values.length;
          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);

          await this.prisma.aggregatedDataPoint.upsert({
            where: {
              tenantId_dataSourceId_period_periodStart_dimensionKey_metricName: {
                tenantId,
                dataSourceId,
                period: period as any,
                periodStart,
                dimensionKey,
                metricName: metric.targetField,
              },
            },
            update: {
              sumValue,
              avgValue,
              countValue,
              minValue,
              maxValue,
            },
            create: {
              tenantId,
              dataSourceId,
              period: period as any,
              periodStart,
              dimensionKey,
              metricName: metric.targetField,
              sumValue,
              avgValue,
              countValue,
              minValue,
              maxValue,
            },
          });
        }
      }
    }

    this.logger.log(
      `Aggregation completed for data source ${dataSourceId}`,
    );
  }

  /**
   * Truncate a date to the start of the given period.
   * Per SRS-3 section 2.1.
   */
  truncateToPeriod(date: Date, period: Period): Date {
    switch (period) {
      case 'HOURLY':
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
          ),
        );
      case 'DAILY':
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
          ),
        );
      case 'WEEKLY': {
        const day = date.getUTCDay();
        const diff = day === 0 ? 6 : day - 1; // Monday as start of week
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() - diff,
          ),
        );
      }
      case 'MONTHLY':
        return new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
        );
      default:
        return date;
    }
  }

  /**
   * Build a dimension key for grouping.
   * Per SRS-3 section 2.2.
   */
  buildDimensionKey(
    dimensions: Record<string, unknown>,
    dimensionFields: { targetField: string }[],
  ): string {
    return dimensionFields
      .sort((a, b) => a.targetField.localeCompare(b.targetField))
      .map(
        (f) => `${f.targetField}=${dimensions[f.targetField] ?? 'NULL'}`,
      )
      .join('|');
  }
}
