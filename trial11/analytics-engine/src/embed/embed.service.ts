import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenantService } from '../tenant/tenant.service.js';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto.js';

@Injectable()
export class EmbedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async createEmbedConfig(dto: CreateEmbedConfigDto) {
    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins,
        // type assertion justified: themeOverrides DTO is Record<string, unknown>, Prisma expects InputJsonValue
        themeOverrides: dto.themeOverrides as Prisma.InputJsonValue,
      },
    });
  }

  async getEmbeddedDashboard(dashboardId: string, apiKey: string) {
    const tenant = await this.tenantService.findByApiKey(apiKey);
    if (!tenant) {
      throw new UnauthorizedException('Invalid API key');
    }

    const dashboard = await this.prisma.dashboard.findUniqueOrThrow({
      where: { id: dashboardId, tenantId: tenant.id },
      include: { widgets: true, embedConfig: true },
    });

    if (!dashboard.embedConfig) {
      throw new NotFoundException('Embed config not found for this dashboard');
    }

    return {
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        layout: dashboard.layout,
        widgets: dashboard.widgets,
      },
      embedConfig: {
        allowedOrigins: dashboard.embedConfig.allowedOrigins,
        themeOverrides: dashboard.embedConfig.themeOverrides,
      },
    };
  }
}
