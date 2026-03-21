// [TRACED:AC-007] Embed CRUD with tenant isolation

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { tenantId: string; dashboardId: string }) {
    return this.prisma.embed.create({
      data: {
        tenantId: data.tenantId,
        dashboardId: data.dashboardId,
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
    // findFirst: querying by id + tenantId composite — no unique constraint on this pair
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
    // findFirst: querying by token which is unique, but using findFirst for consistent null-handling
    const embed = await this.prisma.embed.findFirst({
      where: { token, isActive: true },
      include: { dashboard: { include: { widgets: true } } },
    });

    if (!embed) {
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

    return this.prisma.embed.delete({
      where: { id },
    });
  }
}
