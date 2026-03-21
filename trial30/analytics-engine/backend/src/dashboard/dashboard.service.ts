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
    // findFirst: fetching dashboard by primary key but including widgets relation;
    // future expansion may add tenant-scoped filtering as a composite condition
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
    return this.prisma.dashboard.create({
      data: {
        title: data.title,
        tenantId: data.tenantId,
        userId: data.userId,
      },
    });
  }

  async addWidget(dashboardId: string, type: string, config: string) {
    return this.prisma.widget.create({
      data: {
        type,
        config,
        dashboardId,
      },
    });
  }
}
