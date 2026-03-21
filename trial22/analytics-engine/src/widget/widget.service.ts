// [TRACED:AC-013] Widget service with dashboard association

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Widget } from '@prisma/client';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDashboard(
    dashboardId: string,
    tenantId: string,
  ): Promise<Widget[]> {
    return this.prisma.widget.findMany({
      where: { dashboardId, tenantId },
    });
  }

  async create(
    data: {
      name: string;
      type: string;
      config?: object;
      dashboardId: string;
      tenantId: string;
    },
  ): Promise<Widget> {
    return this.prisma.widget.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config ?? {},
        dashboardId: data.dashboardId,
        tenantId: data.tenantId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: { name?: string; type?: string; config?: object },
  ): Promise<Widget> {
    return this.prisma.widget.update({
      where: { id, tenantId },
      data,
    });
  }

  async remove(id: string, tenantId: string): Promise<Widget> {
    return this.prisma.widget.delete({ where: { id, tenantId } });
  }
}
