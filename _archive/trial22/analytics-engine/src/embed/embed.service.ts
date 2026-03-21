import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmbedConfigDto, UpdateEmbedConfigDto } from './embed.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmbedConfigDto) {
    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins ?? [],
        themeOverrides: (dto.themeOverrides ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findByDashboardId(dashboardId: string) {
    const embed = await this.prisma.embedConfig.findFirst({
      where: { dashboardId },
      include: { dashboard: { include: { widgets: true } } },
    });

    if (!embed) {
      throw new NotFoundException('Embed config not found');
    }

    return embed;
  }

  async update(id: string, dto: UpdateEmbedConfigDto) {
    const existing = await this.prisma.embedConfig.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Embed config not found');
    }

    return this.prisma.embedConfig.update({
      where: { id },
      data: {
        ...(dto.allowedOrigins && { allowedOrigins: dto.allowedOrigins }),
        ...(dto.themeOverrides && {
          themeOverrides: dto.themeOverrides as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.embedConfig.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Embed config not found');
    }

    return this.prisma.embedConfig.delete({ where: { id } });
  }

  async generateEmbedCode(dashboardId: string, baseUrl: string) {
    const embed = await this.findByDashboardId(dashboardId);
    const iframeSrc = `${baseUrl}/embed/${embed.id}`;
    return {
      iframe: `<iframe src="${iframeSrc}" width="100%" height="600" frameborder="0"></iframe>`,
      scriptTag: `<script src="${baseUrl}/embed.js" data-dashboard-id="${dashboardId}"></script>`,
      embedId: embed.id,
    };
  }
}
