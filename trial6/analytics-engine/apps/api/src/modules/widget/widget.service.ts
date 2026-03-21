import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        dashboardId: dto.dashboardId,
        type: dto.type,
        config: toJsonField(dto.config),
        position: dto.position ?? 0,
        width: dto.width ?? 6,
        height: dto.height ?? 4,
      },
    });
  }

  async findByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.widget.findFirstOrThrow({ where: { id } });
  }

  async update(id: string, dto: UpdateWidgetDto) {
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...dto,
        config: dto.config ? toJsonField(dto.config) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.widget.delete({ where: { id } });
  }
}
