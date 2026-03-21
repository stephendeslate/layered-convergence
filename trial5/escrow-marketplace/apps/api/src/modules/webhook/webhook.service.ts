import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(eventType: string, eventId: string, payload: Record<string, unknown>) {
    // Idempotency check: prevent duplicate processing
    // [JUSTIFIED:findFirst] Idempotency check — null means not yet processed, not an error
    const existing = await this.prisma.webhookLog.findFirst({
      where: { eventId },
    });

    if (existing) {
      this.logger.warn(`Duplicate webhook event: ${eventId}`);
      return { status: 'duplicate', eventId };
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        eventType,
        eventId,
        payload,
        idempotencyKey: eventId,
      },
    });

    try {
      await this.handleEvent(eventType, payload);

      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { processedAt: new Date() },
      });

      this.logger.log(`Webhook processed: ${eventType} (${eventId})`);
      return { status: 'processed', eventId };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${eventType} (${eventId})`, error);
      throw error;
    }
  }

  private async handleEvent(eventType: string, payload: Record<string, unknown>) {
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
      case 'charge.dispute.created':
        await this.handleDisputeCreated(payload);
        break;
      default:
        this.logger.warn(`Unhandled webhook event type: ${eventType}`);
    }
  }

  private async handlePaymentSucceeded(payload: Record<string, unknown>) {
    const paymentIntentId = payload.id as string;
    if (!paymentIntentId) return;

    // [JUSTIFIED:findFirst] Looking up by Stripe external ID — may not exist in our system
    const transaction = await this.prisma.transaction.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (transaction) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'HELD' },
      });

      await this.prisma.transactionStateHistory.create({
        data: {
          transactionId: transaction.id,
          fromStatus: 'PENDING_PAYMENT',
          toStatus: 'HELD',
          reason: 'Payment confirmed via Stripe webhook',
        },
      });
    }
  }

  private async handleTransferCreated(payload: Record<string, unknown>) {
    this.logger.log(`Transfer created: ${JSON.stringify(payload)}`);
  }

  private async handlePayoutPaid(payload: Record<string, unknown>) {
    this.logger.log(`Payout paid: ${JSON.stringify(payload)}`);
  }

  private async handleDisputeCreated(payload: Record<string, unknown>) {
    this.logger.log(`Stripe dispute created: ${JSON.stringify(payload)}`);
  }

  async getWebhookLogs(limit: number = 50) {
    return this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
