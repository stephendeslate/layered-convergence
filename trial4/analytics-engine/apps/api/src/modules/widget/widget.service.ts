import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dashboardId: string, dto: CreateWidgetDto) {
    // Verify dashboard belongs to tenant
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    return this.prisma.widget.create({
      data: {
        dashboardId,
        type: dto.type,
        config: dto.config ?? {},
        position: dto.position ?? 0,
        width: dto.width ?? 6,
        height: dto.height ?? 4,
      },
    });
  }

  async findAllByDashboard(tenantId: string, dashboardId: string) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { position: 'asc' },
    });
  }

  async findById(tenantId: string, dashboardId: string, id: string) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    return this.prisma.widget.findFirstOrThrow({
      where: { id, dashboardId },
    });
  }

  async update(tenantId: string, dashboardId: string, id: string, dto: UpdateWidgetDto) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });
    await this.prisma.widget.findFirstOrThrow({ where: { id, dashboardId } });

    return this.prisma.widget.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, dashboardId: string, id: string) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });
    await this.prisma.widget.findFirstOrThrow({ where: { id, dashboardId } });

    return this.prisma.widget.delete({ where: { id } });
  }
}
