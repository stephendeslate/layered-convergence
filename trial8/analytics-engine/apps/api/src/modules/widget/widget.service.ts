import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class WidgetService {
  private readonly logger = new Logger(WidgetService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto) {
    this.logger.log(`Creating ${dto.type} widget for dashboard ${dto.dashboardId}`);
    return this.prisma.widget.create({
      data: {
        dashboardId: dto.dashboardId,
        type: dto.type,
        config: dto.config ? toJsonValue(dto.config) : undefined,
        positionX: dto.positionX,
        positionY: dto.positionY,
        width: dto.width,
        height: dto.height,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.widget.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, dto: UpdateWidgetDto) {
    const data: Record<string, unknown> = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.config !== undefined) data.config = toJsonValue(dto.config);
    if (dto.positionX !== undefined) data.positionX = dto.positionX;
    if (dto.positionY !== undefined) data.positionY = dto.positionY;
    if (dto.width !== undefined) data.width = dto.width;
    if (dto.height !== undefined) data.height = dto.height;

    return this.prisma.widget.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.widget.delete({ where: { id } });
  }
}
