import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  async handleStripeWebhook(@Body() dto: WebhookEventDto) {
    const result = await this.webhookService.processEvent(
      dto.type,
      dto.data ?? {},
      dto.idempotencyKey,
    );

    if (!result) {
      return { status: 'duplicate', message: 'Event already processed' };
    }

    return { status: 'processed', id: result.id };
  }

  @Get()
  findAll() {
    return this.webhookService.findAll();
  }

  @Get('by-type')
  findByEventType(@Query('type') eventType: string) {
    return this.webhookService.findByEventType(eventType);
  }
}
