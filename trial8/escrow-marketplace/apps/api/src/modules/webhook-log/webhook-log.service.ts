import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class WebhookLogService {
  private readonly logger = new Logger(WebhookLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a webhook event has already been processed (idempotency).
   */
  async isProcessed(idempotencyKey: string): Promise<boolean> {
    // findFirst justified: checking for existence of a previously processed webhook —
    // null means the event has not been seen before, which is the expected case for new events
    const existing = await this.prisma.webhookLog.findFirst({
      where: { idempotencyKey },
    });
    return existing !== null;
  }

  async logEvent(eventType: string, stripeEventId: string, payload: Record<string, unknown>) {
    const idempotencyKey = stripeEventId;

    if (await this.isProcessed(idempotencyKey)) {
      this.logger.warn(`Duplicate webhook event: ${stripeEventId}`);
      return null;
    }

    this.logger.log(`Logging webhook event: ${eventType} (${stripeEventId})`);

    return this.prisma.webhookLog.create({
      data: {
        eventType,
        stripeEventId,
        payload: toJsonValue(payload),
        idempotencyKey,
        processedAt: new Date(),
      },
    });
  }

  async findAll(limit: number = 50) {
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
