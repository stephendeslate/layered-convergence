import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PipelineService } from './pipeline.service.js';

export interface SyncJobData {
  dataSourceId: string;
  tenantId: string;
}

@Processor('sync')
export class PipelineProcessor extends WorkerHost {
  private readonly logger = new Logger(PipelineProcessor.name);

  constructor(private readonly pipelineService: PipelineService) {
    super();
  }

  async process(job: Job<SyncJobData>) {
    this.logger.log(`Processing sync job ${job.id} for data source ${job.data.dataSourceId}`);
    try {
      const syncRun = await this.pipelineService.triggerSync(
        job.data.dataSourceId,
        job.data.tenantId,
      );
      return syncRun;
    } catch (err) {
      // type assertion justified: err from catch is unknown by default
      const error = err as Error;
      this.logger.error(`Sync job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }
}
