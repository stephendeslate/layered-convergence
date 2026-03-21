import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmbedConfigDto) {
    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins ?? [],
        themeOverrides: dto.themeOverrides ?? {},
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    const config = await this.prisma.embedConfig.findUnique({
      where: { dashboardId },
      include: { dashboard: { include: { widgets: true } } },
    });

    if (!config) {
      throw new NotFoundException('Embed config not found');
    }

    return config;
  }

  async update(dashboardId: string, dto: UpdateEmbedConfigDto) {
    await this.findByDashboard(dashboardId);
    return this.prisma.embedConfig.update({
      where: { dashboardId },
      data: {
        ...(dto.allowedOrigins !== undefined && { allowedOrigins: dto.allowedOrigins }),
        ...(dto.themeOverrides !== undefined && { themeOverrides: dto.themeOverrides }),
      },
    });
  }

  async remove(dashboardId: string) {
    await this.findByDashboard(dashboardId);
    return this.prisma.embedConfig.delete({ where: { dashboardId } });
  }

  async validateOrigin(dashboardId: string, origin: string): Promise<boolean> {
    const config = await this.prisma.embedConfig.findUnique({
      where: { dashboardId },
    });

    if (!config) return false;

    const origins = config.allowedOrigins as string[];
    return origins.length === 0 || origins.includes(origin);
  }
}
