import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWidgetDto) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dto.dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.widget.create({
      data: {
        tenantId,
        dashboardId: dto.dashboardId,
        type: dto.type as 'LINE' | 'BAR' | 'PIE' | 'METRIC' | 'TABLE',
        title: dto.title,
        config: dto.config,
        position: dto.position,
      },
    });
  }

  async findByDashboard(tenantId: string, dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { tenantId, dashboardId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(tenantId: string, id: string, dto: UpdateWidgetDto) {
    await this.findOne(tenantId, id);

    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type as 'LINE' | 'BAR' | 'PIE' | 'METRIC' | 'TABLE' }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.widget.delete({
      where: { id },
    });
  }
}
