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
    // findFirst justified: filtering by both tenantId and id for tenant isolation
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
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(tenantId, id);

    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.dashboard.delete({
      where: { id },
    });
  }
}
