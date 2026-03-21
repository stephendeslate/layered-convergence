import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

// [TRACED:AC-007] Webhook service for managing event subscriptions
@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(userId: string, dto: CreateWebhookDto) {
    await this.tenantContext.setCurrentUser(userId);

    return this.prisma.webhook.create({
      data: {
        url: dto.url,
        event: dto.event,
        secret: dto.secret,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    await this.tenantContext.setCurrentUser(userId);

    return this.prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to locate webhook with user scope — justification: ensures user can only access their own webhooks
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async delete(userId: string, id: string) {
    await this.tenantContext.setCurrentUser(userId);

    // findFirst to verify ownership before deletion — justification: authorization check before destructive operation
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.delete({ where: { id } });
  }
}
