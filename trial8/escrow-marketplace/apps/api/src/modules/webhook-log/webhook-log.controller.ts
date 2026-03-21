import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';
import { Request } from 'express';

@Controller('webhooks')
export class WebhookLogController {
  constructor(private readonly webhookLogService: WebhookLogService) {}

  /**
   * Stripe webhook endpoint.
   * In production, this would verify the Stripe signature using the webhook secret.
   */
  @Post('stripe')
  async handleStripeWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('stripe-signature') signature?: string,
  ) {
    const eventId = body.id as string;
    const eventType = body.type as string;

    if (!eventId || !eventType) {
      return { received: false, reason: 'Missing event id or type' };
    }

    const logged = await this.webhookLogService.logEvent(eventType, eventId, body);

    if (!logged) {
      return { received: true, duplicate: true };
    }

    // Process the event based on type
    switch (eventType) {
      case 'payment_intent.succeeded':
      case 'transfer.created':
      case 'payout.paid':
      case 'charge.dispute.created':
      case 'charge.dispute.closed':
        // These would trigger business logic in production
        break;
      default:
        break;
    }

    return { received: true };
  }

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.webhookLogService.findAll(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('by-type')
  findByType(@Query('eventType') eventType: string) {
    return this.webhookLogService.findByEventType(eventType);
  }
}
