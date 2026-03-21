import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConfig(dashboardId: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    const existing = await this.prisma.embedConfig.findUnique({
      where: { dashboardId: dashboard.id },
    });

    if (existing) return existing;

    return this.prisma.embedConfig.create({
      data: { dashboardId: dashboard.id },
    });
  }

  async updateConfig(dashboardId: string, tenantId: string, data: {
    allowedOrigins?: string[];
    themeOverrides?: Record<string, unknown>;
  }) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    return this.prisma.embedConfig.upsert({
      where: { dashboardId },
      create: {
        dashboardId,
        allowedOrigins: data.allowedOrigins ?? [],
        themeOverrides: data.themeOverrides ?? {},
      },
      update: data,
    });
  }

  // Public endpoint: load dashboard for embed iframe
  async loadPublicDashboard(dashboardId: string, origin?: string) {
    const dashboard = await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, isPublished: true },
      include: {
        widgets: true,
        embedConfig: true,
        tenant: { select: { primaryColor: true, fontFamily: true, logoUrl: true } },
      },
    });

    // Verify origin is allowed if embed config has restrictions
    if (
      origin &&
      dashboard.embedConfig &&
      dashboard.embedConfig.allowedOrigins.length > 0 &&
      !dashboard.embedConfig.allowedOrigins.includes(origin)
    ) {
      throw new BadRequestException('Origin not allowed for this embed');
    }

    return {
      id: dashboard.id,
      name: dashboard.name,
      layout: dashboard.layout,
      widgets: dashboard.widgets,
      theme: {
        primaryColor: dashboard.tenant.primaryColor,
        fontFamily: dashboard.tenant.fontFamily,
        logoUrl: dashboard.tenant.logoUrl,
        ...((dashboard.embedConfig?.themeOverrides as Record<string, unknown>) ?? {}),
      },
    };
  }
}
