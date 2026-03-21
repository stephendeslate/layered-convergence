import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        layout: (dto.layout ?? {}) as Prisma.InputJsonValue,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true, embed: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true, embed: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(tenantId, id);
    const { layout, ...rest } = dto;
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...rest,
        ...(layout !== undefined && { layout: layout as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
