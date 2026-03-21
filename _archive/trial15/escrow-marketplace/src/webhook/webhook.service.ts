import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async process(eventType: string, payload: object, idempotencyKey: string) {
    // findFirst annotated: idempotencyKey is unique, safe single-result lookup
    const existing = await this.prisma.webhookLog.findFirst({
      where: { idempotencyKey },
    });

    if (existing) {
      return { status: 'already_processed', id: existing.id };
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        eventType,
        payload,
        idempotencyKey,
        processedAt: new Date(),
      },
    });

    return { status: 'processed', id: log.id };
  }
}
