import { Controller, Post, Body, Headers } from '@nestjs/common';
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

    return this.webhookService.processEvent(eventType, eventId, body);
  }
}
