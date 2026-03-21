import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, Prisma } from '@prisma/client';

export interface AuditLogEntry {
  tenantId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an audit log entry directly.
   */
  async log(entry: AuditLogEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: entry.tenantId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        metadata: (entry.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  }

  /**
   * Logs an audit entry derived from an HTTP request context.
   * Used by the AuditInterceptor for automatic mutation logging.
   */
  async logFromRequest(
    request: any,
    _context: ExecutionContext,
  ): Promise<void> {
    const tenantId = request.user?.tenantId;
    if (!tenantId) return;

    const method = request.method;
    const path = request.route?.path ?? request.url;
    const resourceType = this.extractResourceType(path);
    const resourceId = request.params?.id ?? null;

    const action = this.inferAction(method, path);
    if (!action) return;

    await this.log({
      tenantId,
      action,
      resourceType,
      resourceId,
      metadata: {
        method,
        path,
        statusCode: request.res?.statusCode,
      },
      ipAddress: request.ip,
      userAgent: request.headers?.['user-agent'],
    });
  }

  private extractResourceType(path: string): string {
    // Extract resource type from path, e.g., /api/data-sources/123 -> DataSource
    const segments = path
      .replace(/^\/api\//, '')
      .split('/')
      .filter(Boolean);

    if (segments.length === 0) return 'Unknown';

    const resource = segments[0];
    const map: Record<string, string> = {
      'data-sources': 'DataSource',
      dashboards: 'Dashboard',
      widgets: 'Widget',
      'api-keys': 'ApiKey',
      'sync-runs': 'SyncRun',
      theme: 'Theme',
      billing: 'Billing',
      tenant: 'Tenant',
      embed: 'EmbedConfig',
      auth: 'Auth',
    };

    return map[resource] ?? 'Unknown';
  }

  private inferAction(method: string, path: string): AuditAction | null {
    const resource = path.replace(/^\/api\//, '').split('/')[0];

    // Map HTTP method + resource to AuditAction
    const actionMap: Record<string, Record<string, AuditAction>> = {
      'data-sources': {
        POST: AuditAction.DATASOURCE_CREATED,
        PUT: AuditAction.DATASOURCE_UPDATED,
        DELETE: AuditAction.DATASOURCE_DELETED,
      },
      dashboards: {
        POST: AuditAction.DASHBOARD_CREATED,
        PUT: AuditAction.DASHBOARD_UPDATED,
        DELETE: AuditAction.DASHBOARD_DELETED,
      },
      widgets: {
        POST: AuditAction.WIDGET_CREATED,
        PUT: AuditAction.WIDGET_UPDATED,
        DELETE: AuditAction.WIDGET_DELETED,
      },
      'api-keys': {
        POST: AuditAction.API_KEY_CREATED,
        DELETE: AuditAction.API_KEY_REVOKED,
      },
      theme: {
        PUT: AuditAction.THEME_UPDATED,
      },
      embed: {
        PUT: AuditAction.EMBED_CONFIG_UPDATED,
      },
    };

    return actionMap[resource]?.[method] ?? null;
  }
}
