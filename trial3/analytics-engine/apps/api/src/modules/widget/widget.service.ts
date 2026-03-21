import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isValidWidgetType } from '@analytics-engine/shared';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dashboardId: string, tenantId: string, data: {
    type: string;
    config?: Record<string, unknown>;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
  }) {
    if (!isValidWidgetType(data.type)) {
      throw new BadRequestException(`Invalid widget type: ${data.type}`);
    }

    // Verify dashboard belongs to tenant
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    return this.prisma.widget.create({
      data: {
        dashboardId,
        type: data.type,
        config: data.config ?? {},
        positionX: data.positionX ?? 0,
        positionY: data.positionY ?? 0,
        width: data.width ?? 6,
        height: data.height ?? 4,
      },
    });
  }

  async findByDashboard(dashboardId: string, tenantId: string) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { positionY: 'asc' },
    });
  }

  async update(id: string, dashboardId: string, tenantId: string, data: {
    config?: Record<string, unknown>;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
  }) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    await this.prisma.widget.findFirstOrThrow({
      where: { id, dashboardId },
    });

    return this.prisma.widget.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, dashboardId: string, tenantId: string) {
    await this.prisma.dashboard.findFirstOrThrow({
      where: { id: dashboardId, tenantId },
    });

    await this.prisma.widget.findFirstOrThrow({
      where: { id, dashboardId },
    });

    return this.prisma.widget.delete({ where: { id } });
  }
}
