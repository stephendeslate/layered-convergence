import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

// TRACED:PV-003: Webhook notifications are available for transaction events
@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWebhookDto, userId: string) {
    return this.prisma.webhook.create({
      data: {
        url: dto.url,
        event: dto.event,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
