import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class WebhookLogService {
  private readonly logger = new Logger(WebhookLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log a webhook event with idempotency check.
   * Returns null if the event was already processed (duplicate).
   */
  async logEvent(
    eventType: string,
    payload: Record<string, unknown>,
    idempotencyKey: string,
    provider: string = 'stripe',
  ) {
    const existing = await this.prisma.webhookLog.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      this.logger.warn(`Duplicate webhook event: ${idempotencyKey}`);
      return null;
    }

    return this.prisma.webhookLog.create({
      data: {
        provider,
        eventType,
        payload: toJsonField(payload),
        idempotencyKey,
        processedAt: new Date(),
      },
    });
  }

  async findAll(take: number = 50) {
    return this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.webhookLog.findFirstOrThrow({ where: { id } });
  }
}
