import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WidgetType } from '@prisma/client';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        dashboardId: dto.dashboardId,
        type: dto.type,
        config: dto.config || {},
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 1,
        height: dto.height ?? 1,
      },
    });
  }

  async findAllByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.widget.findUniqueOrThrow({
      where: { id },
      include: { dashboard: true },
    });
  }

  async update(id: string, dto: UpdateWidgetDto) {
    await this.prisma.widget.findUniqueOrThrow({ where: { id } });
    return this.prisma.widget.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.prisma.widget.findUniqueOrThrow({ where: { id } });
    return this.prisma.widget.delete({ where: { id } });
  }
}
