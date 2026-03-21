import { Injectable, BadRequestException } from '@nestjs/common';
import { PayoutStatus } from '@prisma/client';
import { PayoutService } from '../payout/payout.service';
import { StripeAccountService } from '../stripe-account/stripe-account.service';

interface StripeEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

@Injectable()
export class WebhookService {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly stripeAccountService: StripeAccountService,
  ) {}

  async handleEvent(event: StripeEvent) {
    switch (event.type) {
      case 'payout.paid': {
        const payoutId = event.data.object['metadata'] as Record<string, string> | undefined;
        if (payoutId?.['escrowPayoutId']) {
          await this.payoutService.updateStatus(
            payoutId['escrowPayoutId'],
            PayoutStatus.COMPLETED,
            event.data.object['id'] as string,
          );
        }
        break;
      }

      case 'payout.failed': {
        const metadata = event.data.object['metadata'] as Record<string, string> | undefined;
        if (metadata?.['escrowPayoutId']) {
          await this.payoutService.updateStatus(
            metadata['escrowPayoutId'],
            PayoutStatus.FAILED,
          );
        }
        break;
      }

      case 'account.updated': {
        const accountId = event.data.object['id'] as string;
        const chargesEnabled = event.data.object['charges_enabled'] as boolean;
        const payoutsEnabled = event.data.object['payouts_enabled'] as boolean;
        const detailsSubmitted = event.data.object['details_submitted'] as boolean;

        try {
          await this.stripeAccountService.update(accountId, {
            chargesEnabled,
            payoutsEnabled,
            detailsSubmitted,
          });
        } catch {
          // Account may not exist in our system yet
        }
        break;
      }

      default:
        break;
    }

    return { received: true };
  }

  verifyWebhookSignature(payload: string, signature: string): StripeEvent {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    // In production, use Stripe SDK to verify signature
    // stripe.webhooks.constructEvent(payload, signature, secret)
    try {
      return JSON.parse(payload) as StripeEvent;
    } catch {
      throw new BadRequestException('Invalid webhook payload');
    }
  }
}
