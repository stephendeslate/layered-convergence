import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';

@Injectable()
export class WidgetService {
  private readonly logger = new Logger(WidgetService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto) {
    const widget = await this.prisma.widget.create({
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
    this.logger.log(`Widget created: ${widget.id} (${widget.type})`);
    return widget;
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.widget.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, dto: UpdateWidgetDto) {
    return this.prisma.widget.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.widget.delete({ where: { id } });
  }
}
