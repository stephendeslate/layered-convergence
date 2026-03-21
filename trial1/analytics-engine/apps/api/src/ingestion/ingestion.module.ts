import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { TransformService } from './transform.service';
import { SyncSchedulerService } from './sync-scheduler.service';

@Module({
  providers: [IngestionService, TransformService, SyncSchedulerService],
  exports: [IngestionService, TransformService, SyncSchedulerService],
})
export class IngestionModule {}
