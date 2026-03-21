import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        dashboardId: dto.dashboardId,
        type: dto.type,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        position: dto.position ?? 0,
        width: dto.width ?? 6,
        height: dto.height ?? 4,
      },
    });
  }

  async findByDashboardId(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    const widget = await this.prisma.widget.findFirst({
      where: { id },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto) {
    await this.findOne(id);
    const { config, ...rest } = dto;
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...rest,
        ...(config !== undefined && { config: config as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.widget.delete({ where: { id } });
  }
}
