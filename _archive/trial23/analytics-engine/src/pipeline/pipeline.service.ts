import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineStatus } from '@prisma/client';
import { CreatePipelineDto, TransitionPipelineDto } from './pipeline.dto';

const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.IDLE]: [PipelineStatus.RUNNING],
  [PipelineStatus.RUNNING]: [PipelineStatus.COMPLETED, PipelineStatus.FAILED],
  [PipelineStatus.COMPLETED]: [PipelineStatus.IDLE],
  [PipelineStatus.FAILED]: [PipelineStatus.IDLE],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        dataSourceId: dto.dataSourceId,
        status: PipelineStatus.IDLE,
      },
    });
  }

  async findOne(id: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async findByDataSourceId(dataSourceId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { dataSourceId },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async transition(id: string, dto: TransitionPipelineDto) {
    const pipeline = await this.findOne(id);
    const allowedStatuses = VALID_TRANSITIONS[pipeline.status];

    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid transition from ${pipeline.status} to ${dto.status}`,
      );
    }

    const data: Record<string, unknown> = {
      status: dto.status,
    };

    if (dto.status === PipelineStatus.RUNNING) {
      data.lastRunAt = new Date();
      data.errorMessage = null;
    }

    if (dto.status === PipelineStatus.FAILED && dto.errorMessage) {
      data.errorMessage = dto.errorMessage;
    }

    if (dto.status === PipelineStatus.COMPLETED) {
      data.errorMessage = null;
    }

    if (dto.status === PipelineStatus.IDLE) {
      data.errorMessage = null;
    }

    await this.prisma.pipelineStateHistory.create({
      data: {
        pipelineId: id,
        fromStatus: pipeline.status,
        toStatus: dto.status,
      },
    });

    return this.prisma.pipeline.update({
      where: { id },
      data,
    });
  }

  async getValidTransitions(id: string): Promise<PipelineStatus[]> {
    const pipeline = await this.findOne(id);
    return VALID_TRANSITIONS[pipeline.status];
  }

  async getStateHistory(id: string) {
    await this.findOne(id);
    return this.prisma.pipelineStateHistory.findMany({
      where: { pipelineId: id },
      orderBy: { timestamp: 'asc' },
    });
  }
}
