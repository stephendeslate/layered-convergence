import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async createConfig(dto: CreateEmbedConfigDto) {
    await this.prisma.dashboard.findUniqueOrThrow({
      where: { id: dto.dashboardId },
    });

    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins || [],
        themeOverrides: dto.themeOverrides || {},
      },
    });
  }

  async getEmbedData(dashboardId: string, origin?: string) {
    const dashboard = await this.prisma.dashboard.findUniqueOrThrow({
      where: { id: dashboardId },
      include: {
        widgets: true,
        embedConfig: true,
        tenant: true,
      },
    });

    if (!dashboard.isPublished) {
      throw new ForbiddenException('Dashboard is not published');
    }

    if (dashboard.embedConfig && origin) {
      const allowed = dashboard.embedConfig.allowedOrigins;
      if (allowed.length > 0 && !allowed.includes(origin) && !allowed.includes('*')) {
        throw new ForbiddenException('Origin not allowed');
      }
    }

    return {
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        layout: dashboard.layout,
      },
      widgets: dashboard.widgets,
      theme: {
        primaryColor: dashboard.tenant.primaryColor,
        fontFamily: dashboard.tenant.fontFamily,
        logoUrl: dashboard.tenant.logoUrl,
        ...(dashboard.embedConfig?.themeOverrides as Record<string, unknown> || {}),
      },
    };
  }

  async findConfigByDashboard(dashboardId: string) {
    return this.prisma.embedConfig.findUniqueOrThrow({
      where: { dashboardId },
    });
  }

  async updateConfig(dashboardId: string, dto: Partial<CreateEmbedConfigDto>) {
    await this.prisma.embedConfig.findUniqueOrThrow({ where: { dashboardId } });
    return this.prisma.embedConfig.update({
      where: { dashboardId },
      data: {
        allowedOrigins: dto.allowedOrigins,
        themeOverrides: dto.themeOverrides,
      },
    });
  }
}
