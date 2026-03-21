import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EmbedConfigDto } from './dto/embed-config.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmbedConfig(dto: EmbedConfigDto) {
    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        tenantId: dto.tenantId,
        allowedOrigins: dto.allowedOrigins ?? [],
        themeOverrides: dto.themeOverrides
          ? toJsonField(dto.themeOverrides)
          : {},
      },
    });
  }

  async getEmbedConfig(id: string) {
    return this.prisma.embedConfig.findFirstOrThrow({
      where: { id },
      include: {
        dashboard: { include: { widgets: true } },
        tenant: true,
      },
    });
  }

  async getEmbedByDashboard(dashboardId: string) {
    return this.prisma.embedConfig.findMany({
      where: { dashboardId },
    });
  }

  async removeEmbedConfig(id: string) {
    return this.prisma.embedConfig.delete({ where: { id } });
  }
}
