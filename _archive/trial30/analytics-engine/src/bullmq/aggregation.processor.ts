import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('aggregation')
export class AggregationProcessor extends WorkerHost {
  async process(job: Job<{ dataSourceId: string; granularity: string }>): Promise<void> {
    const { dataSourceId, granularity } = job.data;
    // Aggregation logic would process data points into time-bucketed summaries
    // In production, this queries DataPoint table and upserts aggregated results
    await job.log(`Processing aggregation for ${dataSourceId} at ${granularity} granularity`);
  }
}
