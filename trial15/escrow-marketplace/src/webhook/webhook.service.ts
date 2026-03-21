import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StripeWebhookPayload {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(payload: StripeWebhookPayload) {
    if (!payload.id || !payload.type) {
      throw new BadRequestException('Invalid webhook payload');
    }

    // Check for idempotency - don't process same event twice
    // findFirst justified: stripeEventId has unique constraint, checking for duplicate
    const existing = await this.prisma.webhookEvent.findFirst({
      // justification: idempotency check - stripeEventId is unique
      where: { stripeEventId: payload.id },
    });

    if (existing) {
      return { status: 'already_processed', event: existing };
    }

    // Store the event
    const event = await this.prisma.webhookEvent.create({
      data: {
        stripeEventId: payload.id,
        eventType: payload.type,
        payload: payload as unknown as Record<string, unknown>,
        processed: false,
      },
    });

    // Process based on event type
    await this.handleEvent(event.id, payload);

    return { status: 'processed', event };
  }

  async handleEvent(eventId: string, payload: StripeWebhookPayload) {
    const handlers: Record<string, () => Promise<void>> = {
      'payment_intent.succeeded': () => this.handlePaymentIntentSucceeded(payload),
      'account.updated': () => this.handleAccountUpdated(payload),
      'payout.paid': () => this.handlePayoutPaid(payload),
      'payout.failed': () => this.handlePayoutFailed(payload),
    };

    const handler = handlers[payload.type];
    if (handler) {
      await handler();
    }

    // Mark as processed
    await this.prisma.webhookEvent.update({
      where: { id: eventId },
      data: { processed: true, processedAt: new Date() },
    });
  }

  private async handlePaymentIntentSucceeded(payload: StripeWebhookPayload) {
    const paymentIntentId = payload.data.object['id'] as string;
    if (!paymentIntentId) return;

    // findFirst justified: looking up transaction by stripe payment intent ID
    const transaction = await this.prisma.transaction.findFirst({
      // justification: stripePaymentIntentId has unique constraint - webhook lookup
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (transaction && transaction.status === 'PENDING') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FUNDED' },
      });
    }
  }

  private async handleAccountUpdated(payload: StripeWebhookPayload) {
    const stripeAccountId = payload.data.object['id'] as string;
    const chargesEnabled = payload.data.object['charges_enabled'] as boolean;
    const payoutsEnabled = payload.data.object['payouts_enabled'] as boolean;
    const detailsSubmitted = payload.data.object['details_submitted'] as boolean;

    if (!stripeAccountId) return;

    // findFirst justified: stripeAccountId has unique constraint
    const account = await this.prisma.stripeAccount.findFirst({
      // justification: stripeAccountId is unique - webhook lookup
      where: { stripeAccountId },
    });

    if (account) {
      await this.prisma.stripeAccount.update({
        where: { id: account.id },
        data: {
          chargesEnabled: chargesEnabled ?? account.chargesEnabled,
          payoutsEnabled: payoutsEnabled ?? account.payoutsEnabled,
          detailsSubmitted: detailsSubmitted ?? account.detailsSubmitted,
        },
      });
    }
  }

  private async handlePayoutPaid(payload: StripeWebhookPayload) {
    const stripePayoutId = payload.data.object['id'] as string;
    if (!stripePayoutId) return;

    // findFirst justified: stripePayoutId has unique constraint on payout model
    const payout = await this.prisma.payout.findFirst({
      // justification: stripePayoutId is unique - webhook lookup
      where: { stripePayoutId },
    });

    if (payout) {
      await this.prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'completed' },
      });
    }
  }

  private async handlePayoutFailed(payload: StripeWebhookPayload) {
    const stripePayoutId = payload.data.object['id'] as string;
    if (!stripePayoutId) return;

    // findFirst justified: stripePayoutId has unique constraint
    const payout = await this.prisma.payout.findFirst({
      // justification: stripePayoutId is unique - webhook lookup
      where: { stripePayoutId },
    });

    if (payout) {
      await this.prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'failed' },
      });
    }
  }

  async findAll() {
    return this.prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Webhook event not found');
    }

    return event;
  }

  async findByStripeEventId(stripeEventId: string) {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { stripeEventId },
    });

    if (!event) {
      throw new NotFoundException('Webhook event not found');
    }

    return event;
  }
}
