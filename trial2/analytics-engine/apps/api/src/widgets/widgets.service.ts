import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dashboardId: string, dto: CreateWidgetDto) {
    // Verify dashboard belongs to tenant
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.widget.create({
      data: {
        dashboardId,
        type: dto.type,
        title: dto.title,
        config: dto.config as Prisma.InputJsonValue,
        position: dto.position as Prisma.InputJsonValue,
        size: dto.size as Prisma.InputJsonValue,
        dataSourceId: dto.dataSourceId,
      },
    });
  }

  async update(tenantId: string, dashboardId: string, widgetId: string, dto: UpdateWidgetDto) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId, dashboardId },
    });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.widget.update({
      where: { id: widgetId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.config !== undefined ? { config: dto.config as Prisma.InputJsonValue } : {}),
        ...(dto.position !== undefined ? { position: dto.position as Prisma.InputJsonValue } : {}),
        ...(dto.size !== undefined ? { size: dto.size as Prisma.InputJsonValue } : {}),
        ...(dto.dataSourceId !== undefined ? { dataSource: dto.dataSourceId ? { connect: { id: dto.dataSourceId } } : { disconnect: true } } : {}),
      },
    });
  }

  async remove(tenantId: string, dashboardId: string, widgetId: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId, dashboardId },
    });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    await this.prisma.widget.delete({ where: { id: widgetId } });
  }
}
