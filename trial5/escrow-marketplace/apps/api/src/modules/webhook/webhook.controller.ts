import { Controller, Post, Get, Body, Headers, Query } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('stripe-signature') signature: string,
  ) {
    const eventType = body.type as string;
    const eventId = body.id as string;

    return this.webhookService.processWebhook(eventType, eventId, body);
  }

  @Get('logs')
  getWebhookLogs(@Query('limit') limit?: string) {
    return this.webhookService.getWebhookLogs(limit ? parseInt(limit, 10) : 50);
  }
}
