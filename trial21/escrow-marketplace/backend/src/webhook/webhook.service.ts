import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookStatus } from '@prisma/client';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  // [TRACED:AC-012] POST /webhooks - registers webhook URL for event notifications
  async create(dto: CreateWebhookDto) {
    return this.prisma.webhook.create({
      data: {
        url: dto.url,
        event: dto.event,
        payload: {},
        status: WebhookStatus.PENDING,
      },
    });
  }

  async findAll() {
    return this.prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  // [TRACED:SA-003] Webhook trigger dispatches payloads to registered endpoints
  async trigger(event: string, payload: Record<string, unknown>) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { event, status: WebhookStatus.PENDING },
    });

    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const newStatus = response.ok
            ? WebhookStatus.SENT
            : WebhookStatus.FAILED;

          return this.prisma.webhook.update({
            where: { id: webhook.id },
            data: { payload, status: newStatus },
          });
        } catch {
          return this.prisma.webhook.update({
            where: { id: webhook.id },
            data: { payload, status: WebhookStatus.FAILED },
          });
        }
      }),
    );

    return results;
  }
}
