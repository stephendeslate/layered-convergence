import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    // findUnique for primary key lookup
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true },
    });
    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async create(dto: CreateDashboardDto, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        tenantId,
      },
    });
  }

  async update(id: string, dto: CreateDashboardDto, tenantId: string) {
    await this.findById(id, tenantId);
    return this.prisma.dashboard.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async delete(id: string, tenantId: string) {
    const dashboard = await this.findById(id, tenantId);
    return this.prisma.dashboard.delete({
      where: { id: dashboard.id },
    });
  }
}
