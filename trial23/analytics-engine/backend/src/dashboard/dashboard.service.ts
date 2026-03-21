// [TRACED:AC-003] Dashboard CRUD with tenant isolation

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; tenantId: string }) {
    return this.prisma.dashboard.create({
      data: {
        name: data.name,
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId (no unique constraint on this composite)
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(id: string, tenantId: string, data: { name?: string }) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.delete({
      where: { id },
    });
  }
}
