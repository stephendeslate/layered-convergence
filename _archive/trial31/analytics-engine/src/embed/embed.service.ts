import { Injectable } from '@nestjs/common';
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
        allowedOrigins: dto.allowedOrigins || [],
        themeOverrides: (dto.themeOverrides || {}) as any,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.embedConfig.findUnique({
      where: { dashboardId },
      include: { dashboard: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.embedConfig.findUniqueOrThrow({
      where: { id },
      include: { dashboard: true },
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

  isOriginAllowed(allowedOrigins: string[], origin: string): boolean {
    if (allowedOrigins.length === 0) return true;
    return allowedOrigins.includes(origin);
  }
}
