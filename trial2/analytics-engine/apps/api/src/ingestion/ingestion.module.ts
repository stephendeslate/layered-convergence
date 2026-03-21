import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { SchemaMapperService } from './schema-mapper.service';
import { TransformService } from './transform.service';
import { SyncSchedulerService } from './sync-scheduler.service';
import { ConnectorsModule } from '../connectors/connectors.module';

@Module({
  imports: [ConnectorsModule],
  providers: [
    IngestionService,
    SchemaMapperService,
    TransformService,
    SyncSchedulerService,
  ],
  exports: [IngestionService, SyncSchedulerService],
})
export class IngestionModule {}
