import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { QueryService } from '../query/query.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { Prisma } from '@prisma/client';

const MAX_WIDGETS_PER_DASHBOARD = 20;

@Injectable()
export class WidgetService {
  private readonly logger = new Logger(WidgetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly queryService: QueryService,
  ) {}

  async create(
    dashboardId: string,
    tenantId: string,
    dto: CreateWidgetDto,
  ) {
    // Verify dashboard exists and belongs to tenant
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    // Cannot add widgets to PUBLISHED dashboard (BRD BR-026)
    if (dashboard.status === 'PUBLISHED') {
      throw new ConflictException(
        'Cannot add widgets to a published dashboard. Revert to draft first.',
      );
    }

    // Check widget limit (BRD BR-028)
    const currentCount = await this.prisma.widget.count({
      where: { dashboardId },
    });
    if (currentCount >= MAX_WIDGETS_PER_DASHBOARD) {
      throw new UnprocessableEntityException({
        code: 'UNPROCESSABLE_ENTITY',
        message: `Maximum ${MAX_WIDGETS_PER_DASHBOARD} widgets per dashboard.`,
        details: {
          currentCount,
          maxWidgets: MAX_WIDGETS_PER_DASHBOARD,
        },
      });
    }

    // Verify data source exists
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dto.dataSourceId, tenantId },
    });
    if (!dataSource) throw new NotFoundException('Data source not found');

    const widget = await this.prisma.widget.create({
      data: {
        dashboardId,
        tenantId,
        dataSourceId: dto.dataSourceId,
        type: dto.type as any,
        title: dto.title,
        subtitle: dto.subtitle,
        gridColumnStart: dto.gridColumnStart ?? 1,
        gridColumnSpan: dto.gridColumnSpan ?? 6,
        gridRowStart: dto.gridRowStart ?? 1,
        gridRowSpan: dto.gridRowSpan ?? 1,
        dimensionField: dto.dimensionField,
        metricFields: dto.metricFields as unknown as Prisma.InputJsonValue,
        dateRangePreset: (dto.dateRangePreset ?? 'LAST_30_DAYS') as any,
        dateRangeStart: dto.dateRangeStart
          ? new Date(dto.dateRangeStart)
          : null,
        dateRangeEnd: dto.dateRangeEnd ? new Date(dto.dateRangeEnd) : null,
        groupingPeriod: (dto.groupingPeriod ?? 'DAILY') as any,
        typeConfig: (dto.typeConfig as Prisma.InputJsonValue) ?? {},
        sortOrder: currentCount,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'WIDGET_CREATED' as any,
      resourceType: 'Widget',
      resourceId: widget.id,
    });

    return widget;
  }

  async update(
    id: string,
    dashboardId: string,
    tenantId: string,
    dto: UpdateWidgetDto,
  ) {
    const widget = await this.findOrThrow(id, dashboardId, tenantId);

    // Check dashboard is not PUBLISHED
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (dashboard?.status === 'PUBLISHED') {
      throw new ConflictException(
        'Cannot edit widgets on a published dashboard. Revert to draft first.',
      );
    }

    const updateData: Record<string, unknown> = {};
    if (dto.type) updateData.type = dto.type;
    if (dto.title) updateData.title = dto.title;
    if (dto.subtitle !== undefined) updateData.subtitle = dto.subtitle;
    if (dto.dataSourceId) updateData.dataSourceId = dto.dataSourceId;
    if (dto.dimensionField) updateData.dimensionField = dto.dimensionField;
    if (dto.metricFields)
      updateData.metricFields = dto.metricFields as unknown as Prisma.InputJsonValue;
    if (dto.dateRangePreset) updateData.dateRangePreset = dto.dateRangePreset;
    if (dto.groupingPeriod) updateData.groupingPeriod = dto.groupingPeriod;
    if (dto.gridColumnStart !== undefined)
      updateData.gridColumnStart = dto.gridColumnStart;
    if (dto.gridColumnSpan !== undefined)
      updateData.gridColumnSpan = dto.gridColumnSpan;
    if (dto.gridRowStart !== undefined)
      updateData.gridRowStart = dto.gridRowStart;
    if (dto.gridRowSpan !== undefined)
      updateData.gridRowSpan = dto.gridRowSpan;
    if (dto.typeConfig)
      updateData.typeConfig = dto.typeConfig as unknown as Prisma.InputJsonValue;

    const updated = await this.prisma.widget.update({
      where: { id },
      data: updateData as any,
    });

    await this.auditService.log({
      tenantId,
      action: 'WIDGET_UPDATED' as any,
      resourceType: 'Widget',
      resourceId: id,
    });

    return updated;
  }

  async delete(id: string, dashboardId: string, tenantId: string) {
    await this.findOrThrow(id, dashboardId, tenantId);

    await this.prisma.widget.delete({ where: { id } });

    await this.auditService.log({
      tenantId,
      action: 'WIDGET_DELETED' as any,
      resourceType: 'Widget',
      resourceId: id,
    });
  }

  async reorder(
    dashboardId: string,
    tenantId: string,
    positions: { id: string; sortOrder: number }[],
  ) {
    // Verify dashboard
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    // Update each widget's sort order
    await this.prisma.$transaction(
      positions.map((pos) =>
        this.prisma.widget.update({
          where: { id: pos.id },
          data: { sortOrder: pos.sortOrder },
        }),
      ),
    );
  }

  async getData(
    id: string,
    tenantId: string,
    tier: string,
    filterOverrides?: {
      dateStart?: string;
      dateEnd?: string;
      filters?: { field: string; operator: string; value: unknown }[];
    },
  ) {
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
    });
    if (!widget) throw new NotFoundException('Widget not found');

    const metricFields = widget.metricFields as {
      field: string;
      aggregation: string;
    }[];

    return this.queryService.executeQuery(
      {
        widgetId: widget.id,
        dataSourceId: widget.dataSourceId,
        tenantId,
        dimensionField: widget.dimensionField,
        metricFields,
        dateRange: {
          preset: widget.dateRangePreset,
          start: filterOverrides?.dateStart
            ? new Date(filterOverrides.dateStart)
            : widget.dateRangeStart ?? undefined,
          end: filterOverrides?.dateEnd
            ? new Date(filterOverrides.dateEnd)
            : widget.dateRangeEnd ?? undefined,
        },
        groupingPeriod: widget.groupingPeriod,
        filters: filterOverrides?.filters,
      },
      tier,
    );
  }

  private async findOrThrow(
    id: string,
    dashboardId: string,
    tenantId: string,
  ) {
    const widget = await this.prisma.widget.findFirst({
      where: { id, dashboardId, tenantId },
    });
    if (!widget) throw new NotFoundException('Widget not found');
    return widget;
  }
}
