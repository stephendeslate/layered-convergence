// [TRACED:AC-011] Pipeline service with state machine transitions
// [TRACED:PV-001] Pipeline state machine: DRAFT -> ACTIVE -> PAUSED -> ARCHIVED

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pipeline, PipelineStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.DRAFT]: [PipelineStatus.ACTIVE],
  [PipelineStatus.ACTIVE]: [PipelineStatus.PAUSED, PipelineStatus.ARCHIVED],
  [PipelineStatus.PAUSED]: [PipelineStatus.ACTIVE, PipelineStatus.ARCHIVED],
  [PipelineStatus.ARCHIVED]: [],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<Pipeline[]> {
    return this.prisma.pipeline.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<Pipeline | null> {
    return this.prisma.pipeline.findFirst({ where: { id, tenantId } });
  }

  async create(
    data: { name: string; config?: object; tenantId: string },
  ): Promise<Pipeline> {
    return this.prisma.pipeline.create({
      data: {
        name: data.name,
        config: data.config ?? {},
        tenantId: data.tenantId,
      },
    });
  }

  async transition(
    id: string,
    tenantId: string,
    newStatus: PipelineStatus,
  ): Promise<Pipeline> {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
    });

    if (!pipeline) {
      throw new BadRequestException('Pipeline not found');
    }

    const allowed = VALID_TRANSITIONS[pipeline.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${pipeline.status} to ${newStatus}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(id: string, tenantId: string): Promise<Pipeline> {
    return this.prisma.pipeline.delete({ where: { id, tenantId } });
  }
}
