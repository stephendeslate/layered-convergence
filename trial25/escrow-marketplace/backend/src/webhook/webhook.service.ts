import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-005] Webhook CRUD service
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string) {
    await this.tenantContext.setUserContext(userId);
    return this.prisma.webhook.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    await this.tenantContext.setUserContext(userId);
    // findFirst justified: filtering by id + ownerId for ownership check
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, ownerId: userId },
    });
    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found`);
    }
    return webhook;
  }

  async create(data: {
    url: string;
    secret: string;
    events: string[];
    ownerId: string;
  }) {
    const webhook = await this.prisma.webhook.create({
      data: {
        url: data.url,
        secret: data.secret,
        events: data.events as Array<'TRANSACTION_CREATED' | 'TRANSACTION_FUNDED' | 'TRANSACTION_RELEASED' | 'TRANSACTION_COMPLETED' | 'TRANSACTION_REFUNDED' | 'DISPUTE_OPENED' | 'DISPUTE_RESOLVED' | 'PAYOUT_COMPLETED' | 'PAYOUT_FAILED'>,
        ownerId: data.ownerId,
      },
    });
    this.logger.log(`Webhook created: ${webhook.id}`);
    return webhook;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.webhook.delete({ where: { id } });
  }
}
