import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessWebhookDto } from './webhook-log.dto';

@Injectable()
export class WebhookLogService {
  constructor(private readonly prisma: PrismaService) {}

  async processWebhook(dto: ProcessWebhookDto) {
    // Idempotency check — prevent duplicate processing
    // [JUSTIFIED:findFirst] existence check — null means event not yet processed
    const existing = await this.prisma.webhookLog.findFirst({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existing) {
      if (existing.processedAt) {
        return { status: 'already_processed', webhookLogId: existing.id };
      }
      // Event exists but not yet processed — proceed
    }

    const log = existing ?? await this.prisma.webhookLog.create({
      data: {
        provider: dto.provider ?? 'stripe',
        eventType: dto.eventType,
        payload: dto.payload,
        idempotencyKey: dto.idempotencyKey,
      },
    });

    // Process the event based on type
    try {
      await this.handleWebhookEvent(dto.eventType, dto.payload);

      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { processedAt: new Date() },
      });

      return { status: 'processed', webhookLogId: log.id };
    } catch (error) {
      throw new BadRequestException(
        `Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(limit = 50) {
    return this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async handleWebhookEvent(eventType: string, payload: Record<string, unknown>) {
    switch (eventType) {
      case 'payment_intent.succeeded':
        // Handle payment confirmation
        break;
      case 'transfer.created':
        // Handle transfer creation
        break;
      case 'payout.paid':
        // Handle payout completion
        break;
      case 'charge.dispute.created':
        // Handle dispute creation
        break;
      case 'charge.dispute.closed':
        // Handle dispute closure
        break;
      default:
        // Log unhandled event types
        break;
    }
  }
}
