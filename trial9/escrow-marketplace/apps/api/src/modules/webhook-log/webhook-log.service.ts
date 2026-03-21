import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class WebhookLogService {
  private readonly logger = new Logger(WebhookLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a webhook event has already been processed (idempotency).
   * Returns true if the event was already processed.
   */
  async isDuplicate(idempotencyKey: string): Promise<boolean> {
    // findFirst justified: idempotencyKey has a @unique constraint, but we want
    // a boolean result rather than throwing on not found. This is a check-before-insert
    // pattern where null means "not a duplicate."
    const existing = await this.prisma.webhookLog.findFirst({
      where: { idempotencyKey },
    });
    return existing !== null;
  }

  async log(eventType: string, payload: Record<string, unknown>, idempotencyKey: string) {
    const entry = await this.prisma.webhookLog.create({
      data: {
        eventType,
        payload,
        idempotencyKey,
        processedAt: new Date(),
      },
    });
    this.logger.log(`Webhook logged: ${eventType} (${idempotencyKey})`);
    return entry;
  }

  async findAll(limit = 50) {
    return this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByEventType(eventType: string) {
    return this.prisma.webhookLog.findMany({
      where: { eventType },
      orderBy: { createdAt: 'desc' },
    });
  }
}
