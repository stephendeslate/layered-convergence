import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('aggregation')
export class AggregationProcessor extends WorkerHost {
  async process(job: Job<{ dataSourceId: string; granularity: string }>): Promise<void> {
    const { dataSourceId, granularity } = job.data;
    await job.log(`Processing aggregation for ${dataSourceId} at ${granularity} granularity`);
  }
}
