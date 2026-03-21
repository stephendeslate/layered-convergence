import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async processStripeEvent(eventId: string, eventType: string, payload: Record<string, any>) {
    const existing = await this.prisma.webhookLog.findUnique({
      where: { idempotencyKey: eventId },
    });

    if (existing) {
      return { status: 'already_processed', webhookLogId: existing.id };
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        provider: 'stripe',
        eventType,
        payload,
        idempotencyKey: eventId,
      },
    });

    await this.handleEvent(eventType, payload);

    await this.prisma.webhookLog.update({
      where: { id: log.id },
      data: { processedAt: new Date() },
    });

    return { status: 'processed', webhookLogId: log.id };
  }

  private async handleEvent(eventType: string, payload: Record<string, any>) {
    switch (eventType) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(payload);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(payload);
        break;
      default:
        break;
    }
  }

  private async handlePaymentIntentSucceeded(payload: Record<string, any>) {
    const paymentIntentId = payload.object?.id;
    if (!paymentIntentId) return;

    // findFirst justified: looking up transaction by unique stripePaymentIntentId field
    const transaction = await this.prisma.transaction.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (transaction && transaction.status === 'PENDING') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FUNDED' },
      });

      await this.prisma.transactionStateHistory.create({
        data: {
          transactionId: transaction.id,
          fromState: 'PENDING',
          toState: 'FUNDED',
          reason: 'Payment confirmed via Stripe webhook',
        },
      });
    }
  }

  private async handlePaymentIntentFailed(payload: Record<string, any>) {
    const paymentIntentId = payload.object?.id;
    if (!paymentIntentId) return;

    // findFirst justified: looking up transaction by unique stripePaymentIntentId field
    const transaction = await this.prisma.transaction.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (transaction && transaction.status === 'PENDING') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'EXPIRED' },
      });

      await this.prisma.transactionStateHistory.create({
        data: {
          transactionId: transaction.id,
          fromState: 'PENDING',
          toState: 'EXPIRED',
          reason: 'Payment failed via Stripe webhook',
        },
      });
    }
  }
}
