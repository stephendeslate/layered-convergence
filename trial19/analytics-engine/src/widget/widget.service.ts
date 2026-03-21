import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

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
    // findFirst justified: filtering by tenantId + id for tenant isolation
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async create(tenantId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        tenantId,
        dashboardId: dto.dashboardId,
        type: dto.type,
        title: dto.title,
        config: dto.config ?? {},
        position: dto.position ?? {},
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateWidgetDto) {
    await this.findOne(tenantId, id);

    return this.prisma.widget.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.widget.delete({
      where: { id },
    });
  }
}
