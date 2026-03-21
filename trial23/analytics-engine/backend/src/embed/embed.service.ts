// [TRACED:AC-007] Embed CRUD with tenant isolation

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
    return this.prisma.embed.findMany({
      where: { tenantId },
      include: { dashboard: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId (no unique constraint on this composite)
    const embed = await this.prisma.embed.findFirst({
      where: { id, tenantId },
      include: { dashboard: true },
    });

    if (!embed) {
      throw new NotFoundException('Embed not found');
    }

    return embed;
  }

  async findByToken(token: string) {
    // findFirst: querying by token which is unique, using findFirst for consistent error handling
    const embed = await this.prisma.embed.findFirst({
      where: { token, isActive: true },
      include: { dashboard: { include: { widgets: true } } },
    });

    if (!embed) {
      throw new NotFoundException('Embed not found or inactive');
    }

    return embed;
  }

  async update(id: string, tenantId: string, data: { isActive?: boolean }) {
    await this.findOne(id, tenantId);

    return this.prisma.embed.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.embed.delete({
      where: { id },
    });
  }
}
