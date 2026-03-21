import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';
import { TransactionService } from '../transaction/transaction.service';
import { PayoutService } from '../payout/payout.service';
import { StripeAccountService } from '../stripe-account/stripe-account.service';

/**
 * Stripe webhook controller.
 * Processes incoming Stripe events with idempotency deduplication.
 * In production, this would verify the Stripe signature.
 */
@Controller('webhooks')
export class WebhookLogController {
  private readonly logger = new Logger(WebhookLogController.name);

  constructor(
    private readonly webhookLogService: WebhookLogService,
    private readonly transactionService: TransactionService,
    private readonly payoutService: PayoutService,
    private readonly stripeAccountService: StripeAccountService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('stripe-signature') signature: string,
  ) {
    const eventType = payload['type'] as string;
    const eventId = payload['id'] as string;

    if (!eventType || !eventId) {
      this.logger.warn('Invalid webhook payload: missing type or id');
      return { received: false };
    }

    // Idempotency check
    if (await this.webhookLogService.isDuplicate(eventId)) {
      this.logger.log(`Duplicate webhook ignored: ${eventId}`);
      return { received: true, duplicate: true };
    }

    // Process based on event type
    await this.processEvent(eventType, payload);

    // Log the processed event
    await this.webhookLogService.log(eventType, payload, eventId);

    return { received: true };
  }

  private async processEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    switch (eventType) {
      case 'payment_intent.succeeded':
        this.logger.log('Payment intent succeeded — transaction held');
        break;
      case 'account.updated': {
        const accountData = payload['data'] as Record<string, unknown> | undefined;
        const accountObj = accountData?.['object'] as Record<string, unknown> | undefined;
        const accountId = accountObj?.['id'] as string | undefined;
        if (accountId) {
          await this.stripeAccountService.completeOnboarding(accountId);
        }
        break;
      }
      case 'transfer.created':
        this.logger.log('Transfer created — payout initiated');
        break;
      case 'payout.paid':
        this.logger.log('Payout paid — funds delivered to provider');
        break;
      case 'charge.dispute.created':
        this.logger.log('Charge dispute created — escalated');
        break;
      default:
        this.logger.log(`Unhandled webhook event type: ${eventType}`);
    }
  }

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.webhookLogService.findAll(limit ? parseInt(limit, 10) : 50);
  }
}
