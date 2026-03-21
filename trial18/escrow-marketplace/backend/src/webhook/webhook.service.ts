import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(transactionId: string, event: string, payload: string) {
    return this.prisma.webhook.create({
      data: {
        transactionId,
        event,
        payload,
      },
    });
  }

  async findByTransaction(transactionId: string) {
    return this.prisma.webhook.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markDelivered(id: string) {
    return this.prisma.webhook.update({
      where: { id },
      data: { deliveredAt: new Date() },
    });
  }
}
