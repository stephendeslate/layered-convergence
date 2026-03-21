import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.dashboard.findMany({
      where: { organizationId },
      include: { widgets: true },
    });
  }

  async findOne(id: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async create(dto: CreateDashboardDto, organizationId: string) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        layout: (dto.layout ?? {}) as Prisma.InputJsonValue,
        organizationId,
      },
      include: { widgets: true },
    });
  }

  async update(id: string, dto: UpdateDashboardDto) {
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        layout: dto.layout as Prisma.InputJsonValue,
        isPublished: dto.isPublished,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string) {
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async addWidget(dashboardId: string, dto: CreateWidgetDto) {
    return this.prisma.dashboardWidget.create({
      data: {
        dashboardId,
        type: dto.type,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        position: dto.position ?? 0,
        size: dto.size ?? 'medium',
      },
    });
  }

  async updateWidget(widgetId: string, dto: UpdateWidgetDto) {
    return this.prisma.dashboardWidget.update({
      where: { id: widgetId },
      data: {
        type: dto.type,
        config: dto.config as Prisma.InputJsonValue,
        position: dto.position,
        size: dto.size,
      },
    });
  }

  async removeWidget(widgetId: string) {
    return this.prisma.dashboardWidget.delete({ where: { id: widgetId } });
  }
}
