import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmbedConfigDto, UpdateEmbedConfigDto } from './dto/create-embed-config.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEmbedConfigDto) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dto.dashboardId, tenantId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins,
        themeOverrides: (dto.themeOverrides ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findByDashboard(tenantId: string, dashboardId: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.embedConfig.findMany({
      where: { dashboardId },
    });
  }

  async findOne(embedId: string) {
    const embed = await this.prisma.embedConfig.findUnique({
      where: { id: embedId },
      include: {
        dashboard: {
          include: {
            widgets: true,
            tenant: { select: { id: true, branding: true } },
          },
        },
      },
    });

    if (!embed) {
      throw new NotFoundException('Embed config not found');
    }

    return embed;
  }

  async update(tenantId: string, embedId: string, dto: UpdateEmbedConfigDto) {
    const embed = await this.prisma.embedConfig.findUnique({
      where: { id: embedId },
      include: { dashboard: true },
    });

    if (!embed || embed.dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Embed config not found');
    }

    return this.prisma.embedConfig.update({
      where: { id: embedId },
      data: {
        ...(dto.allowedOrigins !== undefined ? { allowedOrigins: dto.allowedOrigins } : {}),
        ...(dto.themeOverrides !== undefined ? { themeOverrides: dto.themeOverrides as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async remove(tenantId: string, embedId: string) {
    const embed = await this.prisma.embedConfig.findUnique({
      where: { id: embedId },
      include: { dashboard: true },
    });

    if (!embed || embed.dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Embed config not found');
    }

    await this.prisma.embedConfig.delete({ where: { id: embedId } });
  }

  isOriginAllowed(embed: { allowedOrigins: string[] }, origin: string): boolean {
    if (embed.allowedOrigins.length === 0) return false;
    return embed.allowedOrigins.some((allowed) => {
      if (allowed === origin) return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2);
        return origin.endsWith(domain);
      }
      return false;
    });
  }
}
