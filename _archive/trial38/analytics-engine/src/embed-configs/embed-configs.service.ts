import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';

@Injectable()
export class EmbedConfigsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmbedConfigDto) {
    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins,
        themeOverrides: dto.themeOverrides ?? null,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    const config = await this.prisma.embedConfig.findUnique({
      where: { dashboardId },
    });
    if (!config) {
      throw new NotFoundException(`EmbedConfig for Dashboard ${dashboardId} not found`);
    }
    return config;
  }

  async update(dashboardId: string, dto: UpdateEmbedConfigDto) {
    return this.prisma.embedConfig.update({
      where: { dashboardId },
      data: {
        ...(dto.allowedOrigins !== undefined && { allowedOrigins: dto.allowedOrigins }),
        ...(dto.themeOverrides !== undefined && { themeOverrides: dto.themeOverrides }),
      },
    });
  }

  async remove(dashboardId: string) {
    return this.prisma.embedConfig.delete({
      where: { dashboardId },
    });
  }
}
