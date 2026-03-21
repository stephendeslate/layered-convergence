import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process an incoming webhook event with idempotency checking.
   * Returns null if the event was already processed (idempotency key exists).
   */
  async processEvent(
    eventType: string,
    payload: Record<string, unknown>,
    idempotencyKey: string,
  ) {
    // findFirst justified: checking for existence with a compound condition
    // (idempotencyKey) before insert. Using findFirst instead of findUnique
    // because we want a null return (not a throw) for duplicate detection (convention 5.26).
    const existing = await this.prisma.webhookLog.findFirst({
      where: { idempotencyKey },
    });

    if (existing) {
      this.logger.warn(`Duplicate webhook event: ${idempotencyKey}`);
      return null;
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        eventType,
        payload,
        idempotencyKey,
        processedAt: new Date(),
      },
    });

    this.logger.log(`Processed webhook: ${eventType} (${idempotencyKey})`);
    return log;
  }

  async findAll() {
    return this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findByEventType(eventType: string) {
    return this.prisma.webhookLog.findMany({
      where: { eventType },
      orderBy: { createdAt: 'desc' },
    });
  }
}
