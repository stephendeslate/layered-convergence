import { Injectable, Logger } from '@nestjs/common';
import { AggregationService } from './aggregation.service';

interface AggregationJobData {
  dataSourceId: string;
  tenantId: string;
  syncRunId: string;
  timestampRange: { from: string; to: string };
}

/**
 * BullMQ processor for aggregation jobs.
 * Per SRS-3 section 5.3.
 */
@Injectable()
export class AggregationProcessor {
  private readonly logger = new Logger(AggregationProcessor.name);

  constructor(private readonly aggregationService: AggregationService) {}

  async process(jobData: AggregationJobData): Promise<void> {
    this.logger.log(
      `Processing aggregation for data source ${jobData.dataSourceId}`,
    );

    try {
      await this.aggregationService.aggregateDataPoints(
        jobData.dataSourceId,
        jobData.tenantId,
        {
          from: new Date(jobData.timestampRange.from),
          to: new Date(jobData.timestampRange.to),
        },
      );
      this.logger.log(
        `Aggregation completed for data source ${jobData.dataSourceId}`,
      );
    } catch (error) {
      // Non-critical: raw data is still queryable
      this.logger.error(
        `Aggregation failed for data source ${jobData.dataSourceId}: ${error}`,
      );
      throw error;
    }
  }
}
