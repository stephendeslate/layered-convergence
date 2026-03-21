import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service.js';
import { StripeWebhookDto } from './dto/stripe-webhook.dto.js';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(@Body() dto: StripeWebhookDto) {
    return this.webhookService.processStripeEvent(dto.id, dto.type, dto.data);
  }
}
