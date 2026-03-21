import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service.js';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  process(
    @Body() body: { eventType: string; payload: object; idempotencyKey: string },
  ) {
    return this.webhookService.process(body.eventType, body.payload, body.idempotencyKey);
  }
}
