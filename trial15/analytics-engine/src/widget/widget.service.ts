import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        name: dto.name,
        type: dto.type,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        dashboardId: dto.dashboardId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, dashboardId?: string) {
    return this.prisma.widget.findMany({
      where: {
        tenantId,
        ...(dashboardId ? { dashboardId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: justified because we filter by both id and tenantId for tenant isolation
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
    });

    if (!widget) {
      throw new NotFoundException(`Widget with id ${id} not found`);
    }

    return widget;
  }

  async update(tenantId: string, id: string, dto: UpdateWidgetDto) {
    await this.findOne(tenantId, id);

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data['name'] = dto.name;
    if (dto.type !== undefined) data['type'] = dto.type;
    if (dto.config !== undefined) data['config'] = dto.config as Prisma.InputJsonValue;

    return this.prisma.widget.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.widget.delete({ where: { id } });
  }
}
