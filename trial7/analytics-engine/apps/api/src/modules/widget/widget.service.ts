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
        config: dto.config ? toJsonField(dto.config) : undefined,
        position: dto.position ?? 0,
        sizeX: dto.sizeX ?? 1,
        sizeY: dto.sizeY ?? 1,
      },
    });
  }

  async findAllByDashboard(dashboardId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { position: 'asc' },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.widget.findFirstOrThrow({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateWidgetDto) {
    await this.prisma.widget.findFirstOrThrow({ where: { id } });
    return this.prisma.widget.update({
      where: { id },
      data: {
        config: dto.config ? toJsonField(dto.config) : undefined,
        position: dto.position,
        sizeX: dto.sizeX,
        sizeY: dto.sizeY,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.widget.findFirstOrThrow({ where: { id } });
    return this.prisma.widget.delete({ where: { id } });
  }
}
