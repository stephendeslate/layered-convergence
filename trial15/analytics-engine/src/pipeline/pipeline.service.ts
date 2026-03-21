import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineStatus } from '@prisma/client';

/**
 * Valid state transitions for the pipeline state machine:
 * IDLE → RUNNING
 * RUNNING → COMPLETED
 * RUNNING → FAILED
 * COMPLETED → IDLE (reset)
 * FAILED → IDLE (reset)
 */
const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.IDLE]: [PipelineStatus.RUNNING],
  [PipelineStatus.RUNNING]: [PipelineStatus.COMPLETED, PipelineStatus.FAILED],
  [PipelineStatus.COMPLETED]: [PipelineStatus.IDLE],
  [PipelineStatus.FAILED]: [PipelineStatus.IDLE],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: { name: string; dataSourceId: string },
  ) {
    return this.prisma.pipeline.create({
      data: {
        name: data.name,
        dataSourceId: data.dataSourceId,
        tenantId,
        status: PipelineStatus.IDLE,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: justified because we filter by both id and tenantId for tenant isolation
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline with id ${id} not found`);
    }

    return pipeline;
  }

  async transition(
    tenantId: string,
    id: string,
    targetStatus: PipelineStatus,
    errorMessage?: string,
  ) {
    const pipeline = await this.findOne(tenantId, id);
    const currentStatus = pipeline.status;

    const allowedTargets = VALID_TRANSITIONS[currentStatus];
    if (!allowedTargets || !allowedTargets.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid pipeline state transition: ${currentStatus} → ${targetStatus}. ` +
          `Allowed transitions from ${currentStatus}: ${allowedTargets?.join(', ') ?? 'none'}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: targetStatus,
    };

    if (targetStatus === PipelineStatus.RUNNING) {
      updateData['lastRunAt'] = new Date();
      updateData['errorMessage'] = null;
    }

    if (targetStatus === PipelineStatus.FAILED && errorMessage) {
      updateData['errorMessage'] = errorMessage;
    }

    if (targetStatus === PipelineStatus.IDLE) {
      updateData['errorMessage'] = null;
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: updateData,
    });
  }

  async trigger(tenantId: string, id: string) {
    return this.transition(tenantId, id, PipelineStatus.RUNNING);
  }

  async complete(tenantId: string, id: string) {
    return this.transition(tenantId, id, PipelineStatus.COMPLETED);
  }

  async fail(tenantId: string, id: string, errorMessage: string) {
    return this.transition(tenantId, id, PipelineStatus.FAILED, errorMessage);
  }

  async reset(tenantId: string, id: string) {
    return this.transition(tenantId, id, PipelineStatus.IDLE);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.pipeline.delete({ where: { id } });
  }
}
