import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { toJsonField, fromJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(dto: CreateEmbedConfigDto) {
    const existing = await this.prisma.embedConfig.findUnique({
      where: { dashboardId: dto.dashboardId },
    });

    if (existing) {
      return this.prisma.embedConfig.update({
        where: { id: existing.id },
        data: {
          allowedOrigins: dto.allowedOrigins
            ? toJsonField(dto.allowedOrigins)
            : undefined,
          themeOverrides: dto.themeOverrides
            ? toJsonField(dto.themeOverrides)
            : undefined,
        },
      });
    }

    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins
          ? toJsonField(dto.allowedOrigins)
          : undefined,
        themeOverrides: dto.themeOverrides
          ? toJsonField(dto.themeOverrides)
          : undefined,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.embedConfig.findFirstOrThrow({
      where: { dashboardId },
    });
  }

  /**
   * Render data for an embedded dashboard.
   * Validates the origin against the allowedOrigins list.
   */
  async getEmbedData(dashboardId: string, origin?: string) {
    const config = await this.prisma.embedConfig.findFirstOrThrow({
      where: { dashboardId },
    });

    const allowedOrigins = fromJsonField<string[]>(config.allowedOrigins);

    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      throw new NotFoundException('Dashboard not found');
    }

    const dashboard = await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, isPublished: true },
      include: {
        widgets: { orderBy: { position: 'asc' } },
        tenant: { select: { branding: true } },
      },
    });

    return {
      dashboard,
      themeOverrides: fromJsonField<Record<string, string>>(config.themeOverrides),
    };
  }
}
