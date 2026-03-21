import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-003] Pipeline service with state machine transitions
@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  // [TRACED:SA-002] Pipeline state machine transition map
  private readonly validTransitions: Record<string, string[]> = {
    DRAFT: ['ACTIVE'],
    ACTIVE: ['PAUSED', 'ARCHIVED'],
    PAUSED: ['ACTIVE', 'ARCHIVED'],
    ARCHIVED: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    // findFirst justified: filtering by both id and tenantId for tenant-scoped lookup
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
      include: { syncRuns: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!pipeline) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }
    return pipeline;
  }

  async create(data: { name: string; description?: string; config?: object; tenantId: string }) {
    await this.tenantContext.setTenantContext(data.tenantId);
    const pipeline = await this.prisma.pipeline.create({
      data: {
        name: data.name,
        description: data.description,
        config: data.config ?? {},
        tenantId: data.tenantId,
      },
    });
    this.logger.log(`Pipeline created: ${pipeline.id}`);
    return pipeline;
  }

  async transition(id: string, tenantId: string, targetStatus: string) {
    const pipeline = await this.findOne(id, tenantId);
    const allowed = this.validTransitions[pipeline.status] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition pipeline from ${pipeline.status} to ${targetStatus}`,
      );
    }
    return this.prisma.pipeline.update({
      where: { id },
      data: { status: targetStatus as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.pipeline.delete({ where: { id } });
  }
}
