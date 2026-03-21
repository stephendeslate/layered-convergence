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
        ...(dto.allowedOrigins !== undefined && { allowedOrigins: dto.allowedOrigins }),
        ...(dto.themeOverrides !== undefined && { themeOverrides: dto.themeOverrides as any }),
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.embedConfig.findUnique({
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

  async findOne(id: string) {
    return this.prisma.embedConfig.findUniqueOrThrow({
      where: { id },
      include: {
        dashboard: {
          include: { widgets: true, tenant: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateEmbedConfigDto) {
    return this.prisma.embedConfig.update({
      where: { id },
      data: {
        ...(dto.allowedOrigins !== undefined && { allowedOrigins: dto.allowedOrigins }),
        ...(dto.themeOverrides !== undefined && { themeOverrides: dto.themeOverrides as any }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.embedConfig.delete({ where: { id } });
  }

  async resolveEmbed(dashboardId: string, origin?: string) {
    const config = await this.prisma.embedConfig.findUnique({
      where: { dashboardId },
      include: {
        dashboard: {
          include: { widgets: true, tenant: true },
        },
      },
    });

    if (!config) {
      throw new NotFoundException('Embed configuration not found');
    }

    if (origin && config.allowedOrigins.length > 0) {
      if (!config.allowedOrigins.includes(origin)) {
        throw new NotFoundException('Origin not allowed');
      }
    }

    return config;
  }
}
