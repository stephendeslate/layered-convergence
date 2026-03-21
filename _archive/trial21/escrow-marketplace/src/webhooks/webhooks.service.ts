import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookEventDto } from './dto';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async processEvent(dto: WebhookEventDto, tenantId?: string) {
    const existing = await this.prisma.webhookLog.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existing) {
      throw new ConflictException(
        `Webhook event already processed: ${dto.idempotencyKey}`,
      );
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        eventType: dto.eventType,
        payload: dto.payload,
        idempotencyKey: dto.idempotencyKey,
        processedAt: new Date(),
        tenantId,
      },
    });

    await this.handleEvent(dto.eventType, dto.payload);

    return log;
  }

  async findAll(tenantId?: string) {
    return this.prisma.webhookLog.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.webhookLog.findUnique({
      where: { id },
    });
  }

  async findByEventType(eventType: string) {
    return this.prisma.webhookLog.findMany({
      where: { eventType },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async handleEvent(eventType: string, payload: Record<string, any>) {
    switch (eventType) {
      case 'payment_intent.succeeded':
        break;
      case 'transfer.created':
        break;
      case 'payout.paid':
        break;
      case 'charge.dispute.created':
        break;
      case 'charge.dispute.closed':
        break;
      default:
        break;
    }
  }
}
