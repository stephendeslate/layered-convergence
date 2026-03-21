import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

/**
 * Valid state transitions for Dashboard.
 * Per SRS-3 section 6.2.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    const dashboard = await this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        gridColumns: dto.gridColumns ?? 12,
        status: 'DRAFT',
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'DASHBOARD_CREATED' as any,
      resourceType: 'Dashboard',
      resourceId: dashboard.id,
    });

    return dashboard;
  }

  async update(id: string, tenantId: string, dto: UpdateDashboardDto) {
    const dashboard = await this.findOrThrow(id, tenantId);

    // PUBLISHED dashboards must not be editable (BRD BR-026)
    if (dashboard.status === 'PUBLISHED') {
      throw new ConflictException(
        'Cannot edit a published dashboard. Revert to draft first.',
      );
    }

    const updated = await this.prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        gridColumns: dto.gridColumns,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'DASHBOARD_UPDATED' as any,
      resourceType: 'Dashboard',
      resourceId: id,
    });

    return updated;
  }

  async delete(id: string, tenantId: string) {
    await this.findOrThrow(id, tenantId);

    await this.prisma.dashboard.delete({ where: { id } });

    await this.auditService.log({
      tenantId,
      action: 'DASHBOARD_DELETED' as any,
      resourceType: 'Dashboard',
      resourceId: id,
    });
  }

  async publish(id: string, tenantId: string) {
    const dashboard = await this.findOrThrow(id, tenantId);

    this.validateTransition(dashboard.status, 'PUBLISHED');

    // Must have at least 1 widget to publish
    const widgetCount = await this.prisma.widget.count({
      where: { dashboardId: id },
    });
    if (widgetCount === 0) {
      throw new UnprocessableEntityException(
        'Dashboard must have at least 1 widget to publish.',
      );
    }

    const updated = await this.prisma.dashboard.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    await this.auditService.log({
      tenantId,
      action: 'DASHBOARD_PUBLISHED' as any,
      resourceType: 'Dashboard',
      resourceId: id,
      metadata: { oldStatus: dashboard.status, newStatus: 'PUBLISHED' },
    });

    return updated;
  }

  async archive(id: string, tenantId: string) {
    const dashboard = await this.findOrThrow(id, tenantId);

    this.validateTransition(dashboard.status, 'ARCHIVED');

    const updated = await this.prisma.dashboard.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await this.auditService.log({
      tenantId,
      action: 'DASHBOARD_ARCHIVED' as any,
      resourceType: 'Dashboard',
      resourceId: id,
      metadata: { oldStatus: dashboard.status, newStatus: 'ARCHIVED' },
    });

    return updated;
  }

  async revertToDraft(id: string, tenantId: string) {
    const dashboard = await this.findOrThrow(id, tenantId);

    this.validateTransition(dashboard.status, 'DRAFT');

    const updated = await this.prisma.dashboard.update({
      where: { id },
      data: { status: 'DRAFT' },
    });

    await this.auditService.log({
      tenantId,
      action: 'DASHBOARD_REVERTED_TO_DRAFT' as any,
      resourceType: 'Dashboard',
      resourceId: id,
      metadata: { oldStatus: dashboard.status, newStatus: 'DRAFT' },
    });

    return updated;
  }

  async duplicate(id: string, tenantId: string) {
    const original = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!original) throw new NotFoundException('Dashboard not found');

    // Clone dashboard in DRAFT status
    const clone = await this.prisma.dashboard.create({
      data: {
        tenantId,
        name: `${original.name} (Copy)`,
        description: original.description,
        gridColumns: original.gridColumns,
        status: 'DRAFT',
      },
    });

    // Clone all widgets
    if (original.widgets.length > 0) {
      await this.prisma.widget.createMany({
        data: original.widgets.map((w) => ({
          dashboardId: clone.id,
          tenantId,
          dataSourceId: w.dataSourceId,
          type: w.type,
          title: w.title,
          subtitle: w.subtitle,
          gridColumnStart: w.gridColumnStart,
          gridColumnSpan: w.gridColumnSpan,
          gridRowStart: w.gridRowStart,
          gridRowSpan: w.gridRowSpan,
          dimensionField: w.dimensionField,
          metricFields: w.metricFields as any,
          dateRangePreset: w.dateRangePreset,
          dateRangeStart: w.dateRangeStart,
          dateRangeEnd: w.dateRangeEnd,
          groupingPeriod: w.groupingPeriod,
          typeConfig: w.typeConfig as any,
          sortOrder: w.sortOrder,
        })),
      });
    }

    return this.prisma.dashboard.findUniqueOrThrow({
      where: { id: clone.id },
      include: { widgets: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async get(id: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: {
        widgets: { orderBy: { sortOrder: 'asc' } },
        embedConfig: true,
      },
    });

    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async list(
    tenantId: string,
    query: { cursor?: string; limit?: number; status?: string } = {},
  ) {
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;

    const dashboards = await this.prisma.dashboard.findMany({
      where: where as any,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { widgets: true } },
      },
    });

    const hasMore = dashboards.length > limit;
    const items = hasMore ? dashboards.slice(0, limit) : dashboards;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      data: items,
      meta: {
        pagination: { cursor: nextCursor, hasMore, limit },
      },
    };
  }

  private async findOrThrow(id: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  private validateTransition(currentStatus: string, targetStatus: string) {
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new ConflictException(
        `Cannot transition from ${currentStatus} to ${targetStatus}. ` +
          `Allowed transitions: ${allowed.join(', ') || 'none'}`,
      );
    }
  }
}
