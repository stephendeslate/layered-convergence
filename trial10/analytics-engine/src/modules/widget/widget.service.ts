import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        dashboardId: dto.dashboardId,
        type: dto.type,
        config: dto.config ?? {},
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 6,
        height: dto.height ?? 4,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
    });
  }

  async update(id: string, data: Partial<CreateWidgetDto>) {
    return this.prisma.widget.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.widget.delete({ where: { id } });
  }
}
