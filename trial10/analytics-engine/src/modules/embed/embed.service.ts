import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(dto: CreateEmbedConfigDto) {
    return this.prisma.embedConfig.upsert({
      where: { dashboardId: dto.dashboardId },
      create: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins ?? [],
        themeOverrides: dto.themeOverrides ?? {},
      },
      update: {
        allowedOrigins: dto.allowedOrigins,
        themeOverrides: dto.themeOverrides,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.embedConfig.findUniqueOrThrow({
      where: { dashboardId },
      include: {
        dashboard: {
          include: {
            widgets: true,
            tenant: true,
          },
        },
      },
    });
  }

  async getEmbedData(dashboardId: string) {
    const embedConfig = await this.findByDashboard(dashboardId);
    return {
      dashboard: embedConfig.dashboard,
      theme: {
        primaryColor: embedConfig.dashboard.tenant.primaryColor,
        fontFamily: embedConfig.dashboard.tenant.fontFamily,
        logoUrl: embedConfig.dashboard.tenant.logoUrl,
        ...embedConfig.themeOverrides as Record<string, unknown>,
      },
      widgets: embedConfig.dashboard.widgets,
    };
  }
}
