import { Injectable } from '@nestjs/common';
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
        ...(dto.config !== undefined && { config: dto.config as any }),
        ...(dto.positionX !== undefined && { positionX: dto.positionX }),
        ...(dto.positionY !== undefined && { positionY: dto.positionY }),
        ...(dto.width !== undefined && { width: dto.width }),
        ...(dto.height !== undefined && { height: dto.height }),
      },
    });
  }

  async findAll(dashboardId?: string) {
    return this.prisma.widget.findMany({
      where: dashboardId ? { dashboardId } : undefined,
    });
  }

  async findOne(id: string) {
    return this.prisma.widget.findUniqueOrThrow({ where: { id } });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({ where: { dashboardId } });
  }

  async update(id: string, dto: UpdateWidgetDto) {
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.config !== undefined && { config: dto.config as any }),
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
