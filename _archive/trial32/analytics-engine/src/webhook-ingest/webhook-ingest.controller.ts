import { Controller, Post, Param, Body } from '@nestjs/common';
import { WebhookIngestService } from './webhook-ingest.service.js';

@Controller('ingest')
export class WebhookIngestController {
  constructor(private readonly webhookIngestService: WebhookIngestService) {}

  @Post(':apiKey')
  ingest(
    @Param('apiKey') apiKey: string,
    @Body() payload: Record<string, any>,
  ) {
    return this.webhookIngestService.ingest(apiKey, payload);
  }
}
