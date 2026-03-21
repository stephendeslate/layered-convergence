import { Controller, Get, Post, Param, Body, Headers, Query } from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';

@Controller('webhooks')
export class WebhookLogController {
  constructor(private readonly webhookLogService: WebhookLogService) {}

  /**
   * Stripe webhook receiver endpoint.
   * In production, this would verify the Stripe signature.
   */
  @Post('stripe')
  async handleStripeWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('stripe-signature') signature?: string,
  ) {
    const eventType = (payload['type'] as string) ?? 'unknown';
    const eventId = (payload['id'] as string) ?? `evt_${Date.now()}`;

    const result = await this.webhookLogService.logEvent(
      eventType,
      payload,
      eventId,
    );

    if (!result) {
      return { received: true, duplicate: true };
    }

    return { received: true, eventType };
  }

  @Get('logs')
  findLogs(@Query('take') take?: string) {
    return this.webhookLogService.findAll(take ? parseInt(take, 10) : 50);
  }

  @Get('logs/:id')
  findOne(@Param('id') id: string) {
    return this.webhookLogService.findOneOrThrow(id);
  }
}
