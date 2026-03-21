import { Body, Controller, Param, Post } from '@nestjs/common';
import { WebhookIngestService, WebhookPayload } from './webhook-ingest.service.js';

@Controller('ingest')
export class WebhookIngestController {
  constructor(private readonly webhookIngestService: WebhookIngestService) {}

  @Post(':apiKey')
  ingest(@Param('apiKey') apiKey: string, @Body() payload: WebhookPayload) {
    return this.webhookIngestService.ingest(apiKey, payload);
  }
}
