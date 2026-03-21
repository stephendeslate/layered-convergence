import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto.js';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto.js';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async createConfig(dto: CreateEmbedConfigDto) {
    return this.prisma.embedConfig.create({
      data: dto,
    });
  }

  async getConfig(dashboardId: string) {
    const config = await this.prisma.embedConfig.findUnique({
      where: { dashboardId },
    });
    if (!config) {
      throw new NotFoundException('EmbedConfig not found');
    }
    return config;
  }

  async updateConfig(dashboardId: string, dto: UpdateEmbedConfigDto) {
    await this.getConfig(dashboardId);
    return this.prisma.embedConfig.update({
      where: { dashboardId },
      data: dto,
    });
  }

  async renderByApiKey(apiKey: string) {
    // findFirst: apiKey is unique — at most one tenant
    const tenant = await this.prisma.tenant.findFirst({
      where: { apiKey },
    });
    if (!tenant) {
      throw new NotFoundException('Invalid API key');
    }

    const dashboards = await this.prisma.dashboard.findMany({
      where: { tenantId: tenant.id, isPublished: true },
      include: {
        widgets: true,
        embedConfig: true,
      },
    });

    return {
      tenant: {
        name: tenant.name,
        primaryColor: tenant.primaryColor,
        fontFamily: tenant.fontFamily,
        logoUrl: tenant.logoUrl,
      },
      dashboards,
    };
  }
}
