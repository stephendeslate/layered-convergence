// [TRACED:EM-AC-006] Webhook CRUD with tenant isolation
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { url: string; events: string[]; tenantId: string }) {
    return this.prisma.webhook.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.webhook.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId for tenant isolation
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }

  async deactivate(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.webhook.update({ where: { id }, data: { isActive: false } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.webhook.delete({ where: { id } });
  }
}
