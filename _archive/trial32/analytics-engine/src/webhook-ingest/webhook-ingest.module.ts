import { Module } from '@nestjs/common';
import { WebhookIngestService } from './webhook-ingest.service.js';
import { WebhookIngestController } from './webhook-ingest.controller.js';
import { DataPointModule } from '../datapoint/datapoint.module.js';
import { PipelineModule } from '../pipeline/pipeline.module.js';

@Module({
  imports: [DataPointModule, PipelineModule],
  controllers: [WebhookIngestController],
  providers: [WebhookIngestService],
})
export class WebhookIngestModule {}
