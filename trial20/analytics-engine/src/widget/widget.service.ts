import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateWidgetDto } from './dto/create-widget.dto';

@Injectable()
export class WidgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findByDashboard(dashboardId: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.widget.findMany({
      where: { dashboardId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    // findUnique for primary key lookup
    const widget = await this.prisma.widget.findUnique({
      where: { id },
    });
    if (!widget || widget.tenantId !== tenantId) {
      throw new NotFoundException('Widget not found');
    }
    return widget;
  }

  async create(dto: CreateWidgetDto, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type,
        config: dto.config ?? {},
        dashboardId: dto.dashboardId,
        tenantId,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const widget = await this.findById(id, tenantId);
    return this.prisma.widget.delete({
      where: { id: widget.id },
    });
  }
}
