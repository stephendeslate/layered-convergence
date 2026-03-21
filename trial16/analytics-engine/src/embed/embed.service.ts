import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmbedDto, UpdateEmbedDto } from './embed.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEmbedDto) {
    // Verify dashboard belongs to tenant — findFirst ensures tenant isolation
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dto.dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.embed.create({
      data: {
        tenantId,
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.embed.findMany({
      where: { tenantId },
      include: { dashboard: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst with tenantId ensures tenant isolation at application level
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
    // Public endpoint — no tenant filter needed, token is globally unique
    const embed = await this.prisma.embed.findUnique({
      where: { token },
      include: { dashboard: { include: { widgets: true } } },
    });

    if (!embed || !embed.isActive) {
      throw new NotFoundException('Embed not found or inactive');
    }

    if (embed.expiresAt && embed.expiresAt < new Date()) {
      throw new NotFoundException('Embed has expired');
    }

    return embed;
  }

  async update(tenantId: string, id: string, dto: UpdateEmbedDto) {
    await this.findOne(tenantId, id);

    return this.prisma.embed.update({
      where: { id },
      data: {
        ...(dto.allowedOrigins !== undefined && {
          allowedOrigins: dto.allowedOrigins,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.expiresAt !== undefined && {
          expiresAt: new Date(dto.expiresAt),
        }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.embed.delete({
      where: { id },
    });
  }
}
