import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { BullMqService } from '../bullmq/bullmq.service';
import { WebhookStatus } from '@prisma/client';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly bullmq: BullMqService,
  ) {}

  /**
   * Process an incoming Stripe webhook event.
   *
   * 1. Verify signature (or parse in mock mode)
   * 2. Check idempotency via WebhookLog
   * 3. Create/update WebhookLog with PROCESSING status
   * 4. Enqueue to BullMQ for async processing
   * 5. Return 200 OK immediately
   */
  async processWebhook(rawBody: Buffer, signature: string) {
    // 1. Verify signature / parse event
    let event: { id: string; type: string; data: { object: unknown } };
    try {
      const parsed = this.stripe.constructWebhookEvent(rawBody, signature);
      if (!parsed) {
        throw new Error('Failed to parse webhook event');
      }
      event = parsed as unknown as typeof event;
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received webhook: ${event.type} (${event.id})`);

    // 2. Idempotency check
    const existing = await this.prisma.webhookLog.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existing && existing.status !== WebhookStatus.FAILED) {
      this.logger.log(
        `Skipping duplicate webhook: ${event.id} (status: ${existing.status})`,
      );
      return;
    }

    // 3. Create or update WebhookLog
    await this.prisma.webhookLog.upsert({
      where: { stripeEventId: event.id },
      create: {
        stripeEventId: event.id,
        eventType: event.type,
        status: WebhookStatus.PROCESSING,
        payload: event as any,
      },
      update: {
        status: WebhookStatus.PROCESSING,
        errorMessage: null,
      },
    });

    // 4. Enqueue for async processing
    try {
      await this.bullmq.enqueueWebhook(event.id, event.type, event.data.object);
    } catch (err) {
      this.logger.error(`Failed to enqueue webhook ${event.id}`, err);
      // Still return 200 — we've logged it and can retry
      await this.prisma.webhookLog.update({
        where: { stripeEventId: event.id },
        data: {
          status: WebhookStatus.FAILED,
          errorMessage: `Enqueue failed: ${(err as Error).message}`,
        },
      });
    }
  }

  /**
   * Mark a webhook event as processed.
   */
  async markProcessed(stripeEventId: string) {
    await this.prisma.webhookLog.update({
      where: { stripeEventId },
      data: {
        status: WebhookStatus.PROCESSED,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Mark a webhook event as failed.
   */
  async markFailed(stripeEventId: string, errorMessage: string) {
    await this.prisma.webhookLog.update({
      where: { stripeEventId },
      data: {
        status: WebhookStatus.FAILED,
        errorMessage,
      },
    });
  }

  /**
   * Mark a webhook event as skipped (e.g., no matching transaction).
   */
  async markSkipped(stripeEventId: string) {
    await this.prisma.webhookLog.update({
      where: { stripeEventId },
      data: {
        status: WebhookStatus.SKIPPED,
        processedAt: new Date(),
      },
    });
  }
}
