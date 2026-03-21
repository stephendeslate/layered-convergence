import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetType } from '@prisma/client';

@Injectable()
export class WidgetsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        dashboardId: dto.dashboardId,
        type: dto.type as WidgetType,
        config: dto.config,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 1,
        height: dto.height ?? 1,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
    });
  }

  async findById(id: string) {
    const widget = await this.prisma.widget.findUnique({ where: { id } });
    if (!widget) {
      throw new NotFoundException(`Widget ${id} not found`);
    }
    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto) {
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type as WidgetType }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.positionX !== undefined && { positionX: dto.positionX }),
        ...(dto.positionY !== undefined && { positionY: dto.positionY }),
        ...(dto.width !== undefined && { width: dto.width }),
        ...(dto.height !== undefined && { height: dto.height }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.widget.delete({ where: { id } });
  }
}
