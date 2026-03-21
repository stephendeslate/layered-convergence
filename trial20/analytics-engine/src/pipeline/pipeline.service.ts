import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PipelineState } from '@prisma/client';

/**
 * Pipeline state machine:
 *   DRAFT ↔ ACTIVE ↔ PAUSED → ARCHIVED → DRAFT
 *
 * Valid transitions:
 *   DRAFT    → ACTIVE
 *   ACTIVE   → PAUSED
 *   ACTIVE   → DRAFT
 *   PAUSED   → ACTIVE
 *   PAUSED   → ARCHIVED
 *   ARCHIVED → DRAFT
 */
const VALID_TRANSITIONS: Record<PipelineState, PipelineState[]> = {
  [PipelineState.DRAFT]: [PipelineState.ACTIVE],
  [PipelineState.ACTIVE]: [PipelineState.PAUSED, PipelineState.DRAFT],
  [PipelineState.PAUSED]: [PipelineState.ACTIVE, PipelineState.ARCHIVED],
  [PipelineState.ARCHIVED]: [PipelineState.DRAFT],
};

@Injectable()
export class PipelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    // findUnique for primary key lookup
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
    });
    if (!pipeline || pipeline.tenantId !== tenantId) {
      throw new NotFoundException('Pipeline not found');
    }
    return pipeline;
  }

  async create(dto: CreatePipelineDto, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        config: dto.config ?? {},
        tenantId,
      },
    });
  }

  async transition(id: string, newState: PipelineState, tenantId: string) {
    const pipeline = await this.findById(id, tenantId);
    const allowed = VALID_TRANSITIONS[pipeline.state];

    if (!allowed.includes(newState)) {
      throw new BadRequestException(
        `Cannot transition from ${pipeline.state} to ${newState}. ` +
          `Valid transitions: ${allowed.join(', ')}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { state: newState },
    });
  }

  async delete(id: string, tenantId: string) {
    const pipeline = await this.findById(id, tenantId);
    return this.prisma.pipeline.delete({
      where: { id: pipeline.id },
    });
  }

  getValidTransitions(): Record<PipelineState, PipelineState[]> {
    return VALID_TRANSITIONS;
  }
}
