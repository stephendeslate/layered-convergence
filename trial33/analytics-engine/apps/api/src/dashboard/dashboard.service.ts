import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';
import type { PaginatedResult } from '@analytics-engine/shared';

// TRACED: AE-DM-DASH-001 — Dashboard CRUD with tenant isolation
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    await this.prisma.setTenantContext(tenantId);
    const dashboards = await this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
      orderBy: { createdAt: 'desc' },
    });

    // TRACED: AE-REQ-DASH-001 — Uses shared paginate utility
    return paginate(dashboards, page, pageSize);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: scoped by tenantId for RLS alignment
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async create(tenantId: string, userId: string, name: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.dashboard.create({
      data: { tenantId, userId, name },
    });
  }
}
