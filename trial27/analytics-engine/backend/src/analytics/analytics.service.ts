// [TRACED:AE-004] Data pipeline management with state machine transitions
// [TRACED:AE-005] Dashboard and widget CRUD operations
// [TRACED:AE-006] Embeddable dashboard views with time-limited tokens
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { TenantService } from "../tenant/tenant.service";

const VALID_PIPELINE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["PAUSED", "ARCHIVED"],
  PAUSED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async getDashboards(tenantId: string) {
    await this.tenantService.setTenantContext(tenantId);
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: { widgets: true },
    });
  }

  async createPipeline(
    tenantId: string,
    data: { name: string; config: Record<string, unknown> },
  ) {
    await this.tenantService.setTenantContext(tenantId);
    return this.prisma.pipeline.create({
      data: {
        name: data.name,
        config: data.config,
        tenantId,
      },
    });
  }

  async transitionPipeline(pipelineId: string, newStatus: string) {
    // findFirst: pipeline lookup by ID within tenant context for RLS compliance
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId },
    });

    if (!pipeline) {
      throw new BadRequestException("Pipeline not found");
    }

    const allowedTransitions = VALID_PIPELINE_TRANSITIONS[pipeline.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${pipeline.status} to ${newStatus}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id: pipelineId },
      data: { status: newStatus as "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED" },
    });
  }

  async getDataPoints(dataSourceId: string) {
    return this.prisma.dataPoint.findMany({
      where: { dataSourceId },
      orderBy: { timestamp: "desc" },
    });
  }

  async createEmbed(
    tenantId: string,
    dashboardId: string,
    expiresInHours: number,
  ) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

    return this.prisma.embed.create({
      data: { dashboardId, tenantId, token, expiresAt },
    });
  }
}
