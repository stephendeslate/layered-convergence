import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { DisputeService } from '../dispute/dispute.service';
import { ProviderService } from '../provider/provider.service';
import { PayoutService } from '../payout/payout.service';
import { WebhookService } from './webhook.service';
import { QUEUE_NAMES } from '../bullmq/bullmq.service';
import { TransactionStatus, DisputeStatus } from '@prisma/client';

@Injectable()
export class WebhookHandlersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebhookHandlersService.name);
  private worker: Worker | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly disputeService: DisputeService,
    private readonly providerService: ProviderService,
    private readonly payoutService: PayoutService,
    private readonly webhookService: WebhookService,
  ) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    this.worker = new Worker(
      QUEUE_NAMES.WEBHOOK_PROCESSING,
      async (job: Job) => this.processEvent(job),
      {
        connection: { url: redisUrl },
        concurrency: 5,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `Webhook job ${job?.id} failed: ${err.message}`,
        err.stack,
      );
    });

    this.logger.log('Webhook handlers processor started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }

  async processEvent(
    job: Job<{ eventId: string; eventType: string; data: any }>,
  ) {
    const { eventId, eventType, data } = job.data;
    this.logger.log(`Processing webhook event: ${eventType} (${eventId})`);

    try {
      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(data, eventId);
          break;
        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(data, eventId);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(data, eventId);
          break;
        case 'transfer.created':
          await this.handleTransferCreated(data, eventId);
          break;
        case 'transfer.failed':
          await this.handleTransferFailed(data, eventId);
          break;
        case 'payout.paid':
          await this.handlePayoutPaid(data, eventId);
          break;
        case 'payout.failed':
          await this.handlePayoutFailed(data, eventId);
          break;
        case 'charge.dispute.created':
          await this.handleChargeDisputeCreated(data, eventId);
          break;
        case 'charge.dispute.closed':
          await this.handleChargeDisputeClosed(data, eventId);
          break;
        case 'account.updated':
          await this.handleAccountUpdated(data, eventId);
          break;
        default:
          this.logger.log(`Unhandled webhook event type: ${eventType}`);
          await this.webhookService.markSkipped(eventId);
          return;
      }

      await this.webhookService.markProcessed(eventId);
    } catch (err) {
      this.logger.error(
        `Failed to process webhook ${eventId}: ${(err as Error).message}`,
      );
      await this.webhookService.markFailed(
        eventId,
        (err as Error).message,
      );
      throw err;
    }
  }

  // ─── Payment Intent Succeeded ───────────────────────────────────────────────

  private async handlePaymentIntentSucceeded(data: any, eventId: string) {
    const paymentIntentId = data.id;
    const chargeId =
      typeof data.latest_charge === 'string'
        ? data.latest_charge
        : data.latest_charge?.id || null;

    const txn = await this.transactionService.findByPaymentIntentId(
      paymentIntentId,
    );

    if (!txn) {
      this.logger.warn(
        `No transaction found for PaymentIntent ${paymentIntentId}`,
      );
      await this.webhookService.markSkipped(eventId);
      return;
    }

    if (txn.status !== TransactionStatus.CREATED) {
      this.logger.log(
        `Transaction ${txn.id} already in ${txn.status}, skipping`,
      );
      await this.webhookService.markSkipped(eventId);
      return;
    }

    await this.transactionService.confirmPayment(txn.id, chargeId);
  }

  // ─── Payment Intent Canceled ────────────────────────────────────────────────

  private async handlePaymentIntentCanceled(data: any, eventId: string) {
    const paymentIntentId = data.id;

    const txn = await this.transactionService.findByPaymentIntentId(
      paymentIntentId,
    );

    if (!txn) {
      await this.webhookService.markSkipped(eventId);
      return;
    }

    if (
      txn.status === TransactionStatus.CREATED ||
      txn.status === TransactionStatus.PAYMENT_HELD
    ) {
      await this.transactionService.expireTransaction(txn.id);
    }
  }

  // ─── Payment Intent Failed ──────────────────────────────────────────────────

  private async handlePaymentIntentFailed(data: any, eventId: string) {
    const paymentIntentId = data.id;

    const txn = await this.transactionService.findByPaymentIntentId(
      paymentIntentId,
    );

    if (!txn || txn.status !== TransactionStatus.CREATED) {
      await this.webhookService.markSkipped(eventId);
      return;
    }

    this.logger.warn(
      `Payment failed for transaction ${txn.id}: ${data.last_payment_error?.message || 'unknown'}`,
    );
  }

  // ─── Transfer Created ──────────────────────────────────────────────────────

  private async handleTransferCreated(data: any, eventId: string) {
    const transferId = data.id;
    const transferGroup = data.transfer_group;

    if (transferGroup) {
      const txn = await this.prisma.transaction.findFirst({
        where: {
          OR: [
            { stripeTransferId: transferId },
            { id: transferGroup },
          ],
        },
      });

      if (txn) {
        this.logger.log(
          `Transfer ${transferId} confirmed for transaction ${txn.id}`,
        );
      }
    }
  }

  // ─── Transfer Failed ───────────────────────────────────────────────────────

  private async handleTransferFailed(data: any, eventId: string) {
    const transferId = data.id;

    const txn = await this.prisma.transaction.findFirst({
      where: { stripeTransferId: transferId },
    });

    if (txn) {
      this.logger.error(
        `Transfer ${transferId} failed for transaction ${txn.id}`,
      );
    }
  }

  // ─── Payout Paid ───────────────────────────────────────────────────────────

  private async handlePayoutPaid(data: any, eventId: string) {
    const stripePayoutId = data.id;

    const payout = await this.payoutService.markPayoutPaid(stripePayoutId);

    if (payout) {
      // Transition transaction to PAID_OUT
      try {
        await this.transactionService.markPaidOut(payout.transactionId);
      } catch (err) {
        this.logger.warn(
          `Could not transition transaction ${payout.transactionId} to PAID_OUT: ${err}`,
        );
      }
    } else {
      await this.webhookService.markSkipped(eventId);
    }
  }

  // ─── Payout Failed ─────────────────────────────────────────────────────────

  private async handlePayoutFailed(data: any, eventId: string) {
    const stripePayoutId = data.id;
    const failureReason =
      data.failure_message || data.failure_code || 'Unknown failure';

    const payout = await this.payoutService.markPayoutFailed(
      stripePayoutId,
      failureReason,
    );

    if (!payout) {
      await this.webhookService.markSkipped(eventId);
    }
  }

  // ─── Charge Dispute Created ─────────────────────────────────────────────────

  private async handleChargeDisputeCreated(data: any, eventId: string) {
    const chargeId = data.charge;

    if (!chargeId) {
      await this.webhookService.markSkipped(eventId);
      return;
    }

    const txn = await this.transactionService.findByChargeId(chargeId);

    if (!txn) {
      this.logger.warn(`No transaction found for charge ${chargeId}`);
      await this.webhookService.markSkipped(eventId);
      return;
    }

    await this.disputeService.createChargebackDispute(txn.id);
  }

  // ─── Charge Dispute Closed ──────────────────────────────────────────────────

  private async handleChargeDisputeClosed(data: any, eventId: string) {
    const chargeId = data.charge;
    const status = data.status; // 'won', 'lost', 'needs_response', etc.

    if (!chargeId) {
      await this.webhookService.markSkipped(eventId);
      return;
    }

    const txn = await this.transactionService.findByChargeId(chargeId);

    if (!txn || !txn.dispute) {
      await this.webhookService.markSkipped(eventId);
      return;
    }

    if (status === 'won') {
      // Provider wins — release funds
      await this.prisma.dispute.update({
        where: { id: txn.dispute.id },
        data: {
          status: DisputeStatus.RESOLVED_RELEASED,
          resolvedAt: new Date(),
          resolutionNote: 'Stripe chargeback resolved in provider favor',
        },
      });
    } else if (status === 'lost') {
      // Buyer wins — refund
      await this.prisma.dispute.update({
        where: { id: txn.dispute.id },
        data: {
          status: DisputeStatus.RESOLVED_REFUNDED,
          resolvedAt: new Date(),
          resolutionNote: 'Stripe chargeback resolved in buyer favor',
        },
      });

      // Transition to REFUNDED if still DISPUTED
      if (txn.status === TransactionStatus.DISPUTED) {
        try {
          await this.transactionService.refundTransaction(
            txn.id,
            'system',
            'Stripe chargeback lost',
          );
        } catch (err) {
          this.logger.error(
            `Failed to refund transaction ${txn.id} after chargeback: ${err}`,
          );
        }
      }
    }
  }

  // ─── Account Updated ───────────────────────────────────────────────────────

  private async handleAccountUpdated(data: any, eventId: string) {
    const stripeAccountId = data.id;

    if (!stripeAccountId) {
      await this.webhookService.markSkipped(eventId);
      return;
    }

    await this.providerService.handleOnboardingUpdate(stripeAccountId);
  }
}
