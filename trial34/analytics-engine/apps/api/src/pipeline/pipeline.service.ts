import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PipelineStatus, PIPELINE_STATUSES, slugify } from '@analytics-engine/shared';

// TRACED: AE-DA-STATE-002 — Pipeline state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['RUNNING', 'CANCELLED'],
  RUNNING: ['COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: { runs: { orderBy: { startedAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // TRACED: AE-CQ-SLUG-003 — slugify used for pipeline slug generation
  async create(name: string, config: Record<string, unknown>, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const slug = slugify(name);
    return this.prisma.pipeline.create({
      data: { name, slug, config, tenantId, status: 'PENDING' },
    });
  }

  async updateStatus(id: string, newStatus: string, tenantId: string) {
    if (!PIPELINE_STATUSES.includes(newStatus as PipelineStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    await this.prisma.setTenantContext(tenantId);
    // findFirst: fetching pipeline by ID within tenant scope for state transition
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
    });
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const allowed = VALID_TRANSITIONS[pipeline.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${pipeline.status} to ${newStatus}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: newStatus as PipelineStatus },
    });
  }
}
