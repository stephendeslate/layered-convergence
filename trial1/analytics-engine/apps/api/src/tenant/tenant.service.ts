import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/** Tier limits configuration */
const TIER_LIMITS: Record<string, Record<string, number>> = {
  FREE: {
    dataSources: 3,
    dashboards: 5,
    widgets: 20,
    apiCalls: 10_000,
  },
  PRO: {
    dataSources: 20,
    dashboards: 50,
    widgets: 100,
    apiCalls: 100_000,
  },
  ENTERPRISE: {
    dataSources: Infinity,
    dashboards: Infinity,
    widgets: Infinity,
    apiCalls: Infinity,
  },
};

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get tenant detail with basic usage stats.
   */
  async get(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        tier: true,
        region: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        textColor: true,
        fontFamily: true,
        cornerRadius: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  /**
   * Update tenant information.
   */
  async update(tenantId: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const changedFields: string[] = [];
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      changedFields.push('name');
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email;
      changedFields.push('email');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData as any,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        tier: true,
        region: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'TENANT_UPDATED' as any,
      resourceType: 'Tenant',
      resourceId: tenantId,
      metadata: { changedFields },
    });

    return updated;
  }

  /**
   * Get current usage vs tier limits.
   */
  async getUsage(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const [dataSourceCount, dashboardCount, widgetCount] = await Promise.all([
      this.prisma.dataSource.count({ where: { tenantId } }),
      this.prisma.dashboard.count({ where: { tenantId } }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);

    const limits = TIER_LIMITS[tenant.tier] ?? TIER_LIMITS.FREE;

    return {
      tier: tenant.tier,
      usage: {
        dataSources: { current: dataSourceCount, limit: limits.dataSources },
        dashboards: { current: dashboardCount, limit: limits.dashboards },
        widgets: { current: widgetCount, limit: limits.widgets },
      },
    };
  }

  /**
   * Upgrade (or downgrade) tenant subscription tier.
   */
  async upgradeTier(tenantId: string, newTier: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const validTiers = ['FREE', 'PRO', 'ENTERPRISE'];
    if (!validTiers.includes(newTier)) {
      throw new ForbiddenException(`Invalid tier: ${newTier}`);
    }

    if (tenant.tier === newTier) {
      throw new ForbiddenException(`Tenant is already on the ${newTier} tier`);
    }

    const oldTier = tenant.tier;
    const isUpgrade = validTiers.indexOf(newTier) > validTiers.indexOf(oldTier);

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { tier: newTier as any },
      select: {
        id: true,
        name: true,
        tier: true,
      },
    });

    await this.auditService.log({
      tenantId,
      action: (isUpgrade ? 'TIER_UPGRADED' : 'TIER_DOWNGRADED') as any,
      resourceType: 'Tenant',
      resourceId: tenantId,
      metadata: { from: oldTier, to: newTier },
    });

    this.logger.log(
      `Tenant ${tenantId} ${isUpgrade ? 'upgraded' : 'downgraded'}: ${oldTier} -> ${newTier}`,
    );

    return updated;
  }
}
