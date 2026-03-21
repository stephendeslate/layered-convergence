import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { slugify, paginate, DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';

// TRACED: AE-FC-DASH-001 — Dashboard service with CRUD operations
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const dashboards = await this.prisma.dashboard.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return paginate(dashboards, 1, DEFAULT_PAGE_SIZE);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: fetching dashboard by ID within tenant scope for RLS compliance
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  // TRACED: AE-CQ-SLUG-002 — slugify used for dashboard slug generation
  async create(name: string, description: string | undefined, tenantId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);
    const slug = slugify(name);
    return this.prisma.dashboard.create({
      data: {
        name,
        slug,
        description: description ?? '',
        tenantId,
        createdById: userId,
      },
    });
  }
}
