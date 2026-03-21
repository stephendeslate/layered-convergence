// [TRACED:AE-AC-007] Embed CRUD with tenant isolation
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { dashboardId: string; tenantId: string }) {
    return this.prisma.embed.create({
      data: {
        dashboardId: data.dashboardId,
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.embed.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId for tenant isolation
    const embed = await this.prisma.embed.findFirst({
      where: { id, tenantId },
    });

    if (!embed) {
      throw new NotFoundException('Embed not found');
    }

    return embed;
  }

  async findByToken(token: string) {
    const embed = await this.prisma.embed.findUnique({
      where: { token },
      include: { dashboard: { include: { widgets: true } } },
    });

    if (!embed || !embed.isActive) {
      throw new NotFoundException('Embed not found or inactive');
    }

    return embed;
  }

  async deactivate(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.embed.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.embed.delete({ where: { id } });
  }
}
