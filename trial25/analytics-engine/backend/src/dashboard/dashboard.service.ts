import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-004] Dashboard CRUD service with tenant isolation
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true, owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    // findFirst justified: filtering by id + tenantId for tenant-scoped access control
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true, embeds: true },
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }
    return dashboard;
  }

  async create(data: { title: string; isPublic?: boolean; tenantId: string; ownerId: string }) {
    await this.tenantContext.setTenantContext(data.tenantId);
    const dashboard = await this.prisma.dashboard.create({ data });
    this.logger.log(`Dashboard created: ${dashboard.id}`);
    return dashboard;
  }

  async update(id: string, tenantId: string, data: { title?: string; isPublic?: boolean }) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
