// [TRACED:AC-006] Widget CRUD operations

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; type: string; dashboardId: string; config?: Record<string, unknown> }) {
    return this.prisma.widget.create({
      data: {
        name: data.name,
        type: data.type,
        dashboardId: data.dashboardId,
        config: data.config ?? {},
      },
    });
  }

  async findAll(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
    });
  }

  async findOne(id: string) {
    const widget = await this.prisma.widget.findUnique({
      where: { id },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(id: string, data: { name?: string; type?: string; config?: Record<string, unknown> }) {
    await this.findOne(id);

    return this.prisma.widget.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.widget.delete({
      where: { id },
    });
  }
}
