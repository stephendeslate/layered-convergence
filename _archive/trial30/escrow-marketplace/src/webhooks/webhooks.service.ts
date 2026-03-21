import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processEvent(event: WebhookEvent): Promise<{ processed: boolean; message: string }> {
    const existing = await this.prisma.webhookLog.findUnique({
      where: { idempotencyKey: event.id },
    });

    if (existing) {
      this.logger.log(`Duplicate webhook event: ${event.id}`);
      return { processed: false, message: 'Event already processed' };
    }

    try {
      await this.prisma.webhookLog.create({
        data: {
          eventType: event.type,
          payload: event.data as Prisma.JsonObject,
          idempotencyKey: event.id,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Duplicate webhook event');
      }
      throw error;
    }

    await this.handleEvent(event);

    return { processed: true, message: `Processed ${event.type}` };
  }

  private async handleEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        this.logger.log(`Payment intent succeeded: ${event.data.id}`);
        break;
      case 'transfer.created':
        this.logger.log(`Transfer created: ${event.data.id}`);
        break;
      case 'payout.paid':
        this.logger.log(`Payout paid: ${event.data.id}`);
        break;
      case 'charge.dispute.created':
        this.logger.log(`Dispute created: ${event.data.id}`);
        break;
      case 'charge.dispute.closed':
        this.logger.log(`Dispute closed: ${event.data.id}`);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  async findAll(limit = 50) {
    return this.prisma.webhookLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEventType(eventType: string) {
    return this.prisma.webhookLog.findMany({
      where: { eventType },
      orderBy: { createdAt: 'desc' },
    });
  }
}
