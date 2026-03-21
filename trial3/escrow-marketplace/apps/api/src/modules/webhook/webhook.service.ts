import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processEvent(eventId: string, eventType: string, payload: Record<string, unknown>): Promise<boolean> {
    // [VERIFY:WEBHOOK_IDEMPOTENCY] Check for duplicate event
    // findFirst justified: checking for existence of a webhook log is a valid null-check pattern
    const existing = await this.prisma.webhookLog.findFirst({
      where: { eventId },
    });

    if (existing) {
      this.logger.log(`Duplicate webhook event ${eventId} — skipping`);
      return false; // Already processed
    }

    // Log the event
    const log = await this.prisma.webhookLog.create({
      data: {
        eventId,
        eventType,
        payload,
      },
    });

    try {
      await this.handleEvent(eventType, payload);

      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { processedAt: new Date() },
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { error: errorMessage },
      });
      this.logger.error(`Webhook processing failed: ${eventType} — ${errorMessage}`);
      throw error;
    }
  }

  private async handleEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    switch (eventType) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(payload);
        break;
      case 'transfer.created':
        await this.handleTransferCreated(payload);
        break;
      case 'payout.paid':
        await this.handlePayoutPaid(payload);
        break;
      case 'account.updated':
        await this.handleAccountUpdated(payload);
        break;
      default:
        this.logger.log(`Unhandled event type: ${eventType}`);
    }
  }

  private async handlePaymentSucceeded(payload: Record<string, unknown>): Promise<void> {
    const paymentIntentId = (payload as Record<string, Record<string, string>>).data?.object?.id;
    if (!paymentIntentId) return;

    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (transaction.status === 'PAYMENT_PENDING') {
      await this.prisma.$transaction([
        this.prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'HELD' },
        }),
        this.prisma.transactionStateHistory.create({
          data: {
            transactionId: transaction.id,
            fromState: 'PAYMENT_PENDING',
            toState: 'HELD',
            reason: 'Payment confirmed via Stripe webhook',
          },
        }),
      ]);
    }
  }

  private async handleTransferCreated(payload: Record<string, unknown>): Promise<void> {
    const transferId = (payload as Record<string, Record<string, string>>).data?.object?.id;
    if (!transferId) return;

    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: { stripeTransferId: transferId },
    });

    if (transaction.status === 'TRANSFER_PENDING') {
      await this.prisma.$transaction([
        this.prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'TRANSFERRED' },
        }),
        this.prisma.transactionStateHistory.create({
          data: {
            transactionId: transaction.id,
            fromState: 'TRANSFER_PENDING',
            toState: 'TRANSFERRED',
            reason: 'Transfer confirmed via Stripe webhook',
          },
        }),
      ]);
    }
  }

  private async handlePayoutPaid(payload: Record<string, unknown>): Promise<void> {
    this.logger.log('Payout paid event received');
    // In a full implementation, would update payout record status
    void payload;
  }

  private async handleAccountUpdated(payload: Record<string, unknown>): Promise<void> {
    const accountId = (payload as Record<string, Record<string, string>>).data?.object?.id;
    if (!accountId) return;

    // findFirst justified: account may not be in our system yet (webhook can fire before our DB record)
    const account = await this.prisma.stripeConnectedAccount.findFirst({
      where: { stripeAccountId: accountId },
    });

    if (account) {
      const obj = (payload as Record<string, Record<string, Record<string, boolean>>>).data?.object;
      await this.prisma.stripeConnectedAccount.update({
        where: { id: account.id },
        data: {
          chargesEnabled: obj?.charges_enabled ?? account.chargesEnabled,
          payoutsEnabled: obj?.payouts_enabled ?? account.payoutsEnabled,
          onboardingStatus: obj?.charges_enabled ? 'ACTIVE' : 'IN_PROGRESS',
        },
      });
    }
  }
}
