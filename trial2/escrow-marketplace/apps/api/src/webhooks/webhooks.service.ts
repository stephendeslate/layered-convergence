import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { StripeConnectService } from '../stripe/stripe-connect.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
    private stripeConnectService: StripeConnectService,
  ) {}

  async processEvent(event: Stripe.Event): Promise<void> {
    const existing = await this.prisma.webhookLog.findUnique({
      where: { eventId: event.id },
    });

    if (existing) {
      this.logger.log(`Duplicate webhook event ${event.id}, skipping`);
      await this.prisma.webhookLog.update({
        where: { id: existing.id },
        data: { status: 'DUPLICATE' },
      });
      return;
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        eventId: event.id,
        eventType: event.type,
        payload: event.data as object,
        status: 'PROCESSING',
      },
    });

    try {
      await this.routeEvent(event);

      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Webhook processing failed for ${event.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date(),
        },
      });
    }
  }

  private async routeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        this.logger.warn(`Payment intent failed: ${(event.data.object as Stripe.PaymentIntent).id}`);
        break;
      case 'transfer.created':
        await this.handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      case 'charge.dispute.created':
        this.logger.warn(`Stripe dispute created: ${(event.data.object as Stripe.Dispute).id}`);
        break;
      case 'charge.dispute.closed':
        this.logger.log(`Stripe dispute closed: ${(event.data.object as Stripe.Dispute).id}`);
        break;
      case 'account.updated':
        await this.handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      case 'payout.paid':
        await this.handlePayoutPaid(event.data.object as Stripe.Payout);
        break;
      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
    await this.transactionsService.holdTransaction(paymentIntent.id, paymentIntent.id);
  }

  private async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    this.logger.log(`Transfer created: ${transfer.id}`);
    if (transfer.metadata?.transactionId) {
      await this.prisma.payout.updateMany({
        where: {
          transactionId: transfer.metadata.transactionId,
          stripeTransferId: transfer.id,
        },
        data: {
          status: 'PROCESSING',
        },
      });
    }
  }

  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    this.logger.log(`Account updated: ${account.id}`);
    const connected = await this.prisma.stripeConnectedAccount.findUnique({
      where: { stripeAccountId: account.id },
    });

    if (connected) {
      let status: string;
      if (account.charges_enabled && account.payouts_enabled) {
        status = 'ACTIVE';
      } else if (account.details_submitted) {
        status = 'RESTRICTED';
      } else {
        status = 'PENDING';
      }

      await this.prisma.stripeConnectedAccount.update({
        where: { id: connected.id },
        data: {
          onboardingStatus: status as 'ACTIVE' | 'RESTRICTED' | 'PENDING',
          chargesEnabled: account.charges_enabled ?? false,
          payoutsEnabled: account.payouts_enabled ?? false,
          detailsSubmitted: account.details_submitted ?? false,
        },
      });
    }
  }

  private async handlePayoutPaid(payout: Stripe.Payout): Promise<void> {
    this.logger.log(`Payout paid: ${payout.id}`);
    if (payout.metadata?.transactionId) {
      await this.prisma.payout.updateMany({
        where: {
          transactionId: payout.metadata.transactionId,
        },
        data: {
          status: 'COMPLETED',
          stripePayoutId: payout.id,
          completedAt: new Date(),
        },
      });
    }
  }
}
