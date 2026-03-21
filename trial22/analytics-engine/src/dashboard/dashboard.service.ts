// [TRACED:AC-005] Dashboard service with tenant-scoped CRUD

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Dashboard } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<Dashboard[]> {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Dashboard | null> {
    return this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });
  }

  async create(
    data: { name: string; tenantId: string },
  ): Promise<Dashboard> {
    return this.prisma.dashboard.create({ data });
  }

  async update(
    id: string,
    tenantId: string,
    data: { name?: string },
  ): Promise<Dashboard> {
    return this.prisma.dashboard.update({
      where: { id },
      data: { ...data, tenantId },
    });
  }

  async remove(id: string, tenantId: string): Promise<Dashboard> {
    return this.prisma.dashboard.delete({
      where: { id, tenantId },
    });
  }
}
