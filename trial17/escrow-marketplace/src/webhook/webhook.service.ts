import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayoutService } from '../payout/payout.service';
import { StripeAccountService } from '../stripe-account/stripe-account.service';

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payoutService: PayoutService,
    private readonly stripeAccountService: StripeAccountService,
  ) {}

  async handleEvent(event: StripeEvent) {
    const existing = await this.prisma.webhook.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existing) {
      return { received: true, duplicate: true };
    }

    await this.prisma.webhook.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        payload: event as unknown as Record<string, unknown>,
        processed: false,
      },
    });

    switch (event.type) {
      case 'payout.paid': {
        const metadata = event.data.object['metadata'] as Record<string, string> | undefined;
        if (metadata?.['escrowPayoutId']) {
          await this.payoutService.updateStatus(
            metadata['escrowPayoutId'],
            'COMPLETED',
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
            'FAILED',
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

    await this.prisma.webhook.update({
      where: { stripeEventId: event.id },
      data: { processed: true },
    });

    return { received: true };
  }

  verifyWebhookSignature(payload: string, signature: string): StripeEvent {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return JSON.parse(payload) as StripeEvent;
    } catch {
      throw new BadRequestException('Invalid webhook payload');
    }
  }
}
