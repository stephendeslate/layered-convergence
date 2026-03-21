import { Module } from '@nestjs/common';
import { WebhookIngestService } from './webhook-ingest.service.js';
import { WebhookIngestController } from './webhook-ingest.controller.js';
import { TenantModule } from '../tenant/tenant.module.js';

@Module({
  imports: [TenantModule],
  controllers: [WebhookIngestController],
  providers: [WebhookIngestService],
})
export class WebhookIngestModule {}
