import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/**
 * Dual-mode Stripe service.
 * - If STRIPE_SECRET_KEY is set and not a placeholder, uses real Stripe SDK.
 * - Otherwise, returns realistic mock responses for development.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string | null;
  public readonly isMockMode: boolean;

  private mockCounter = 0;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || null;

    const isPlaceholder =
      !secretKey ||
      secretKey === 'sk_test_your_key_here' ||
      secretKey.startsWith('sk_test_your');

    if (!isPlaceholder) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion });
      this.isMockMode = false;
      this.logger.log('Stripe initialized in LIVE mode');
    } else {
      this.stripe = null;
      this.isMockMode = true;
      this.logger.log(
        'Stripe initialized in MOCK mode — no real API calls will be made',
      );
    }
  }

  private nextId(prefix: string): string {
    this.mockCounter++;
    const rand = Math.random().toString(36).substring(2, 14);
    return `${prefix}_mock_${rand}${this.mockCounter}`;
  }

  // ─── PaymentIntent ──────────────────────────────────────────────────────────

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
    captureMethod?: 'manual' | 'automatic';
  }): Promise<{
    id: string;
    clientSecret: string;
    status: string;
  }> {
    if (this.stripe) {
      const pi = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        capture_method: params.captureMethod || 'manual',
        metadata: params.metadata,
      });
      return {
        id: pi.id,
        clientSecret: pi.client_secret!,
        status: pi.status,
      };
    }

    const id = this.nextId('pi');
    return {
      id,
      clientSecret: `${id}_secret_${this.nextId('sec')}`,
      status: 'requires_payment_method',
    };
  }

  async capturePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    chargeId: string | null;
  }> {
    if (this.stripe) {
      const pi = await this.stripe.paymentIntents.capture(paymentIntentId);
      const chargeId =
        typeof pi.latest_charge === 'string'
          ? pi.latest_charge
          : pi.latest_charge?.id || null;
      return { id: pi.id, status: pi.status, chargeId };
    }

    return {
      id: paymentIntentId,
      status: 'succeeded',
      chargeId: this.nextId('ch'),
    };
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
  }> {
    if (this.stripe) {
      const pi = await this.stripe.paymentIntents.cancel(paymentIntentId);
      return { id: pi.id, status: pi.status };
    }

    return { id: paymentIntentId, status: 'canceled' };
  }

  // ─── Transfers ──────────────────────────────────────────────────────────────

  async createTransfer(params: {
    amount: number;
    destination: string;
    transferGroup?: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; amount: number }> {
    if (this.stripe) {
      const transfer = await this.stripe.transfers.create({
        amount: params.amount,
        currency: 'usd',
        destination: params.destination,
        transfer_group: params.transferGroup,
        metadata: params.metadata,
      });
      return { id: transfer.id, amount: transfer.amount };
    }

    return { id: this.nextId('tr'), amount: params.amount };
  }

  // ─── Refunds ────────────────────────────────────────────────────────────────

  async createRefund(params: {
    paymentIntentId: string;
    reason?: string;
  }): Promise<{ id: string; status: string }> {
    if (this.stripe) {
      const refund = await this.stripe.refunds.create({
        payment_intent: params.paymentIntentId,
        reason: 'requested_by_customer',
      });
      return { id: refund.id, status: refund.status || 'succeeded' };
    }

    return { id: this.nextId('re'), status: 'succeeded' };
  }

  // ─── Connected Accounts ─────────────────────────────────────────────────────

  async createConnectedAccount(params: {
    email: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string }> {
    if (this.stripe) {
      const account = await this.stripe.accounts.create({
        type: 'express',
        email: params.email,
        metadata: params.metadata,
        capabilities: {
          transfers: { requested: true },
        },
      });
      return { id: account.id };
    }

    return { id: this.nextId('acct') };
  }

  async createAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    if (this.stripe) {
      const link = await this.stripe.accountLinks.create({
        account: params.accountId,
        refresh_url: params.refreshUrl,
        return_url: params.returnUrl,
        type: 'account_onboarding',
      });
      return { url: link.url };
    }

    return {
      url: `https://connect.stripe.com/setup/mock/${params.accountId}`,
    };
  }

  async getAccount(
    accountId: string,
  ): Promise<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  }> {
    if (this.stripe) {
      const account = await this.stripe.accounts.retrieve(accountId);
      return {
        chargesEnabled: account.charges_enabled ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
        detailsSubmitted: account.details_submitted ?? false,
      };
    }

    return {
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    };
  }

  // ─── Webhooks ───────────────────────────────────────────────────────────────

  constructWebhookEvent(
    payload: Buffer | string,
    signature: string,
  ): Stripe.Event | null {
    if (this.stripe && this.webhookSecret) {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    }

    // In mock mode, parse the payload directly (no signature verification)
    if (typeof payload === 'string') {
      return JSON.parse(payload) as Stripe.Event;
    }
    return JSON.parse(payload.toString()) as Stripe.Event;
  }

  /**
   * Health check: returns true if Stripe is reachable or in mock mode.
   */
  async isHealthy(): Promise<boolean> {
    if (this.isMockMode) return true;
    try {
      await this.stripe!.balance.retrieve();
      return true;
    } catch {
      return false;
    }
  }
}
