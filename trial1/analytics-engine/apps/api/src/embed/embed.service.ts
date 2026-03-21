import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';

@Injectable()
export class EmbedService {
  private readonly logger = new Logger(EmbedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create an embed configuration for a dashboard.
   * Validates that the dashboard exists and belongs to the tenant.
   */
  async createEmbedConfig(tenantId: string, dto: CreateEmbedConfigDto) {
    // Verify dashboard exists and belongs to tenant
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dto.dashboardId, tenantId },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    // Check if embed config already exists for this dashboard
    const existing = await this.prisma.embedConfig.findUnique({
      where: { dashboardId: dto.dashboardId },
    });
    if (existing) {
      throw new ForbiddenException(
        'Embed config already exists for this dashboard. Use update instead.',
      );
    }

    // Validate origins include protocol
    this.validateOrigins(dto.allowedOrigins);

    const embedConfig = await this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        tenantId,
        allowedOrigins: dto.allowedOrigins,
        isEnabled: dto.isEnabled ?? false,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'EMBED_CONFIG_UPDATED' as any,
      resourceType: 'EmbedConfig',
      resourceId: embedConfig.id,
      metadata: { allowedOrigins: dto.allowedOrigins, isEnabled: dto.isEnabled },
    });

    return embedConfig;
  }

  /**
   * Get embed configuration by ID.
   */
  async getEmbedConfig(id: string, tenantId: string) {
    const config = await this.prisma.embedConfig.findFirst({
      where: { id, tenantId },
      include: { dashboard: { select: { id: true, name: true, status: true } } },
    });
    if (!config) throw new NotFoundException('Embed config not found');
    return config;
  }

  /**
   * List embed configs for a tenant, optionally filtered by dashboardId.
   */
  async listEmbedConfigs(
    tenantId: string,
    query: { dashboardId?: string; cursor?: string; limit?: number } = {},
  ) {
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { tenantId };
    if (query.dashboardId) where.dashboardId = query.dashboardId;

    const configs = await this.prisma.embedConfig.findMany({
      where: where as any,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { dashboard: { select: { id: true, name: true, status: true } } },
    });

    const hasMore = configs.length > limit;
    const items = hasMore ? configs.slice(0, limit) : configs;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      data: items,
      meta: { pagination: { cursor: nextCursor, hasMore, limit } },
    };
  }

  /**
   * Update embed configuration.
   */
  async updateEmbedConfig(id: string, tenantId: string, dto: UpdateEmbedConfigDto) {
    const config = await this.prisma.embedConfig.findFirst({
      where: { id, tenantId },
    });
    if (!config) throw new NotFoundException('Embed config not found');

    if (dto.allowedOrigins) {
      this.validateOrigins(dto.allowedOrigins);
    }

    const updated = await this.prisma.embedConfig.update({
      where: { id },
      data: {
        ...(dto.allowedOrigins !== undefined && { allowedOrigins: dto.allowedOrigins }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'EMBED_CONFIG_UPDATED' as any,
      resourceType: 'EmbedConfig',
      resourceId: id,
      metadata: { allowedOrigins: updated.allowedOrigins, isEnabled: updated.isEnabled },
    });

    return updated;
  }

  /**
   * Delete embed configuration.
   */
  async deleteEmbedConfig(id: string, tenantId: string) {
    const config = await this.prisma.embedConfig.findFirst({
      where: { id, tenantId },
    });
    if (!config) throw new NotFoundException('Embed config not found');

    await this.prisma.embedConfig.delete({ where: { id } });

    await this.auditService.log({
      tenantId,
      action: 'EMBED_CONFIG_UPDATED' as any,
      resourceType: 'EmbedConfig',
      resourceId: id,
      metadata: { deleted: true },
    });
  }

  /**
   * Generate an HTML embed code snippet for the given embed config.
   * Returns an iframe + script tag that can be pasted into third-party sites.
   */
  async generateEmbedCode(id: string, tenantId: string) {
    const config = await this.prisma.embedConfig.findFirst({
      where: { id, tenantId },
      include: { dashboard: { select: { id: true, name: true } } },
    });
    if (!config) throw new NotFoundException('Embed config not found');

    const baseUrl = process.env.EMBED_BASE_URL ?? 'http://localhost:3002';
    const dashboardId = config.dashboardId;

    const html = [
      `<!-- Analytics Engine Embed: ${config.dashboard.name} -->`,
      `<div id="ae-embed-${dashboardId}" style="width:100%;min-height:400px;">`,
      `  <iframe`,
      `    src="${baseUrl}/embed/${dashboardId}"`,
      `    style="width:100%;height:100%;border:none;min-height:400px;"`,
      `    allow="clipboard-read; clipboard-write"`,
      `    loading="lazy"`,
      `    title="${config.dashboard.name}"`,
      `  ></iframe>`,
      `</div>`,
    ].join('\n');

    return { html, embedId: id, dashboardId };
  }

  /**
   * Validate that a request origin is in the allowed origins list.
   * Per SRS-4 section 2.1: exact match, no wildcards.
   */
  validateOrigin(embedId: string, origin: string | undefined, allowedOrigins: string[]): boolean {
    // If no Origin header, deny
    if (!origin) return false;

    // Empty allowedOrigins means embed is disabled
    if (allowedOrigins.length === 0) return false;

    // Exact match
    return allowedOrigins.includes(origin);
  }

  /**
   * Get embed data for the public endpoint (API key auth).
   * Returns dashboard layout + widget configs + data.
   */
  async getEmbedData(embedId: string, tenantId: string) {
    const config = await this.prisma.embedConfig.findFirst({
      where: { id: embedId, tenantId },
      include: {
        dashboard: {
          include: {
            widgets: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (!config) throw new NotFoundException('Embed config not found');

    if (!config.isEnabled) {
      throw new ForbiddenException('Embed is disabled');
    }

    if (config.dashboard.status !== 'PUBLISHED') {
      throw new ForbiddenException('Dashboard must be published for embedding');
    }

    // Get tenant theme
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        textColor: true,
        fontFamily: true,
        cornerRadius: true,
        logoUrl: true,
      },
    });

    return {
      id: config.dashboard.id,
      name: config.dashboard.name,
      gridColumns: config.dashboard.gridColumns,
      theme: tenant,
      widgets: config.dashboard.widgets.map((w) => ({
        id: w.id,
        type: w.type,
        title: w.title,
        subtitle: w.subtitle,
        gridColumnStart: w.gridColumnStart,
        gridColumnSpan: w.gridColumnSpan,
        gridRowStart: w.gridRowStart,
        gridRowSpan: w.gridRowSpan,
        dataSourceId: w.dataSourceId,
        dimensionField: w.dimensionField,
        metricFields: w.metricFields,
        dateRangePreset: w.dateRangePreset,
        groupingPeriod: w.groupingPeriod,
        typeConfig: w.typeConfig,
      })),
      embedConfig: {
        id: config.id,
        allowedOrigins: config.allowedOrigins,
      },
    };
  }

  /**
   * Validate that all origins include a protocol.
   */
  private validateOrigins(origins: string[]) {
    for (const origin of origins) {
      if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
        throw new ForbiddenException(
          `Origin "${origin}" must include protocol (e.g., https://example.com)`,
        );
      }
    }
  }
}
