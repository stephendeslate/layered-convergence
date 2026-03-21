import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async process(data: {
    idempotencyKey: string;
    event: string;
    payload: any;
  }) {
    const existing = await this.prisma.webhookLog.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });

    if (existing) {
      throw new ConflictException(
        `Webhook with idempotency key ${data.idempotencyKey} already processed`,
      );
    }

    return this.prisma.webhookLog.create({
      data: {
        idempotencyKey: data.idempotencyKey,
        event: data.event,
        payload: data.payload,
      },
    });
  }

  async findAll() {
    return this.prisma.webhookLog.findMany({
      orderBy: { processedAt: 'desc' },
    });
  }

  async findByKey(idempotencyKey: string) {
    return this.prisma.webhookLog.findUnique({
      where: { idempotencyKey },
    });
  }
}
