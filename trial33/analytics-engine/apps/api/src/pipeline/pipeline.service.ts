import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PIPELINE_STATUSES } from '@analytics-engine/shared';
import type { PipelineStatus } from '@analytics-engine/shared';

// TRACED: AE-SM-PIPE-001 — Pipeline state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['RUNNING', 'CANCELLED'],
  RUNNING: ['COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: ['PENDING'],
  CANCELLED: ['PENDING'],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: { runs: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
  }

  async transition(runId: string, toStatus: PipelineStatus, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: scoped by pipeline's tenant for RLS alignment
    const run = await this.prisma.pipelineRun.findFirst({
      where: { id: runId },
      include: { pipeline: true },
    });

    if (!run) {
      throw new NotFoundException('Pipeline run not found');
    }

    const allowed = VALID_TRANSITIONS[run.status] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${run.status} to ${toStatus}`,
      );
    }

    return this.prisma.pipelineRun.update({
      where: { id: runId },
      data: {
        status: toStatus,
        completedAt: toStatus === 'COMPLETED' || toStatus === 'FAILED' ? new Date() : undefined,
      },
    });
  }
}
