import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';
import { toJsonValue, fromJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class EmbedService {
  private readonly logger = new Logger(EmbedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createConfig(dto: CreateEmbedConfigDto) {
    this.logger.log(`Creating embed config for dashboard ${dto.dashboardId}`);
    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins ? toJsonValue(dto.allowedOrigins) : undefined,
        themeOverrides: dto.themeOverrides ? toJsonValue(dto.themeOverrides) : undefined,
      },
    });
  }

  async getConfig(dashboardId: string) {
    return this.prisma.embedConfig.findUniqueOrThrow({
      where: { dashboardId },
      include: {
        dashboard: {
          include: { widgets: true, tenant: true },
        },
      },
    });
  }

  async updateConfig(dashboardId: string, dto: UpdateEmbedConfigDto) {
    const data: Record<string, unknown> = {};
    if (dto.allowedOrigins !== undefined) data.allowedOrigins = toJsonValue(dto.allowedOrigins);
    if (dto.themeOverrides !== undefined) data.themeOverrides = toJsonValue(dto.themeOverrides);

    return this.prisma.embedConfig.update({
      where: { dashboardId },
      data,
    });
  }

  async getEmbedData(dashboardId: string, origin?: string) {
    const config = await this.getConfig(dashboardId);
    const allowedOrigins = fromJsonValue<string[]>(config.allowedOrigins);

    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      this.logger.warn(`Origin ${origin} not allowed for dashboard ${dashboardId}`);
      return null;
    }

    return {
      dashboard: config.dashboard,
      theme: {
        primaryColor: config.dashboard.tenant.primaryColor,
        fontFamily: config.dashboard.tenant.fontFamily,
        logoUrl: config.dashboard.tenant.logoUrl,
        ...fromJsonValue<Record<string, unknown>>(config.themeOverrides),
      },
    };
  }

  async generateEmbedCode(dashboardId: string): Promise<string> {
    const config = await this.getConfig(dashboardId);
    const baseUrl = process.env.EMBED_BASE_URL ?? 'http://localhost:3000';
    return `<iframe src="${baseUrl}/embed/${dashboardId}" width="100%" height="600" frameborder="0" style="border: none;"></iframe>`;
  }
}
