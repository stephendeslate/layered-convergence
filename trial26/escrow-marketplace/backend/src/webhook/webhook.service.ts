// [TRACED:EM-004] Webhook integration for event notifications
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

// [TRACED:BE-007] Webhook service
@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async createWebhook(url: string, events: string[], secret: string) {
    return this.prisma.webhook.create({
      data: { url, events, secret },
    });
  }

  async getActiveWebhooks() {
    return this.prisma.webhook.findMany({
      where: { isActive: true },
    });
  }

  async deactivateWebhook(webhookId: string) {
    return this.prisma.webhook.update({
      where: { id: webhookId },
      data: { isActive: false },
    });
  }
}
