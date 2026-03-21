import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto, TransitionPipelineDto } from './pipeline.dto';

const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.DRAFT]: [PipelineStatus.ACTIVE],
  [PipelineStatus.ACTIVE]: [PipelineStatus.PAUSED, PipelineStatus.ARCHIVED],
  [PipelineStatus.PAUSED]: [PipelineStatus.ACTIVE, PipelineStatus.ARCHIVED],
  [PipelineStatus.ARCHIVED]: [PipelineStatus.DRAFT],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: { dataSource: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: filtering by tenantId + id for tenant isolation
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
      include: { dataSource: true },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async create(tenantId: string, dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        config: dto.config ?? {},
        dataSourceId: dto.dataSourceId,
      },
    });
  }

  async transition(tenantId: string, id: string, dto: TransitionPipelineDto) {
    const pipeline = await this.findOne(tenantId, id);
    const currentStatus = pipeline.status;
    const targetStatus = dto.status;

    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${targetStatus}. Allowed: ${allowedTransitions.join(', ')}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: targetStatus },
      include: { dataSource: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.pipeline.delete({
      where: { id },
    });
  }
}
