import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true, embeds: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: filtering by tenantId + id for tenant isolation
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true, embeds: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        layout: dto.layout ?? {},
        isPublic: dto.isPublic ?? false,
      },
      include: { widgets: true, embeds: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(tenantId, id);

    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
      include: { widgets: true, embeds: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.dashboard.delete({
      where: { id },
    });
  }
}
