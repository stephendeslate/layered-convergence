import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTenant(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including related widgets
    // and validating existence before returning to the controller
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async create(data: { title: string; tenantId: string; userId: string }) {
    return this.prisma.dashboard.create({ data });
  }

  async addWidget(dashboardId: string, type: string, config: string) {
    await this.findById(dashboardId);
    return this.prisma.widget.create({
      data: { type, config, dashboardId },
    });
  }
}
