// [TRACED:AC-001] Pipeline CRUD with tenant isolation
// [TRACED:AC-002] Pipeline state machine with validated transitions
// [TRACED:PV-003] Pipeline state machine enforces valid transitions only
// [TRACED:SA-004] findFirst calls have justification comments

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.DRAFT]: [PipelineStatus.ACTIVE],
  [PipelineStatus.ACTIVE]: [PipelineStatus.PAUSED, PipelineStatus.ARCHIVED],
  [PipelineStatus.PAUSED]: [PipelineStatus.ACTIVE, PipelineStatus.ARCHIVED],
  [PipelineStatus.ARCHIVED]: [],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; tenantId: string; config?: Record<string, unknown> }) {
    return this.prisma.pipeline.create({
      data: {
        name: data.name,
        tenantId: data.tenantId,
        config: data.config ?? {},
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
    });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId (no unique constraint on this composite)
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async update(id: string, tenantId: string, data: { name?: string; config?: Record<string, unknown> }) {
    await this.findOne(id, tenantId);

    return this.prisma.pipeline.update({
      where: { id },
      data,
    });
  }

  async transition(id: string, tenantId: string, newStatus: PipelineStatus) {
    const pipeline = await this.findOne(id, tenantId);

    const allowedTransitions = VALID_TRANSITIONS[pipeline.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${pipeline.status} to ${newStatus}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.pipeline.delete({
      where: { id },
    });
  }
}
