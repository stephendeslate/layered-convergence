import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('sync')
export class SyncProcessor extends WorkerHost {
  async process(job: Job<{ dataSourceId: string; syncRunId: string }>): Promise<void> {
    const { dataSourceId, syncRunId } = job.data;
    // Sync logic would execute the connector (API poll, PG query, etc.)
    // and ingest data points, updating the SyncRun status along the way
    await job.log(`Processing sync for data source ${dataSourceId}, run ${syncRunId}`);
  }
}
