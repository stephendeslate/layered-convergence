import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  TransitionPipelineDto,
  PipelineStatus,
  VALID_TRANSITIONS,
} from './pipeline.dto';

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePipelineDto) {
    // Verify data source belongs to tenant — findFirst ensures tenant isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dto.dataSourceId, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return this.prisma.pipeline.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        config: dto.config,
        dataSourceId: dto.dataSourceId,
        status: 'DRAFT',
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: { dataSource: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst with tenantId ensures tenant isolation at the application level
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
      include: { dataSource: true },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async update(tenantId: string, id: string, dto: UpdatePipelineDto) {
    await this.findOne(tenantId, id);

    return this.prisma.pipeline.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.config !== undefined && { config: dto.config }),
      },
    });
  }

  async transition(
    tenantId: string,
    id: string,
    dto: TransitionPipelineDto,
  ) {
    const pipeline = await this.findOne(tenantId, id);
    const currentStatus = pipeline.status as PipelineStatus;
    const targetStatus = dto.targetStatus;

    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid state transition: ${currentStatus} -> ${targetStatus}. ` +
          `Allowed transitions from ${currentStatus}: ${allowedTransitions?.join(', ') || 'none'}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: targetStatus },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.pipeline.delete({
      where: { id },
    });
  }
}
