import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  public readonly stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  onModuleInit() {
    const key = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    if (!key.startsWith('sk_test_')) {
      this.logger.warn(
        'Stripe key does not start with sk_test_. This demo should only use test mode keys.',
      );
    }

    if (key.startsWith('sk_live_')) {
      throw new Error(
        'CRITICAL: Live Stripe keys detected. This is a demo application. ' +
        'Use test mode keys only (sk_test_...).',
      );
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
  }

  async createTransfer(
    amount: number,
    currency: string,
    destination: string,
    transferGroup: string,
    idempotencyKey: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Transfer> {
    return this.stripe.transfers.create(
      {
        amount,
        currency,
        destination,
        transfer_group: transferGroup,
        metadata,
      },
      { idempotencyKey },
    );
  }

  async createRefund(
    paymentIntentId: string,
    idempotencyKey: string,
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create(
      { payment_intent: paymentIntentId },
      { idempotencyKey },
    );
  }

  async cancelPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
