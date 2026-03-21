import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async processEvent(eventType: string, eventId: string, payload: Record<string, unknown>) {
    // Idempotency check — prevent duplicate processing
    const existing = await this.prisma.webhookLog.findFirst({
      where: { eventId },
    }); // [JUSTIFIED:FIND_FIRST] — idempotency check, null return means "not yet processed"

    if (existing) {
      throw new ConflictException(`Event ${eventId} already processed`);
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        eventType,
        eventId,
        payload: toJsonField(payload),
        idempotencyKey: eventId,
        processedAt: new Date(),
      },
    });

    return { processed: true, logId: log.id };
  }
}
