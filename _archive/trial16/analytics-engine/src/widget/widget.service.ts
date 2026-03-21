import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
        config: dto.config ?? {},
        position: dto.position ?? {},
        size: dto.size ?? {},
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
    });
  }

  async findOne(id: string) {
    const widget = await this.prisma.widget.findUnique({ where: { id } });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto) {
    await this.findOne(id);
    return this.prisma.widget.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.widget.delete({ where: { id } });
  }
}
