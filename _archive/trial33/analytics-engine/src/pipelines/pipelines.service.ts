import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PipelineStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { validateTransition } from './pipeline-status.machine';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.pipeline.findMany({
      where: { organizationId },
      include: { statusHistory: true },
    });
  }

  async findOne(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { statusHistory: true },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async create(dto: CreatePipelineDto, organizationId: string) {
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        description: dto.description,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        organizationId,
      },
    });
  }

  async update(id: string, dto: UpdatePipelineDto) {
    return this.prisma.pipeline.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config as Prisma.InputJsonValue,
      },
    });
  }

  async transition(id: string, newStatus: PipelineStatus) {
    const pipeline = await this.findOne(id);
    validateTransition(pipeline.status, newStatus);

    return this.prisma.$transaction(async (tx) => {
      await tx.pipelineStatusHistory.create({
        data: {
          pipelineId: id,
          fromStatus: pipeline.status,
          toStatus: newStatus,
        },
      });

      return tx.pipeline.update({
        where: { id },
        data: { status: newStatus },
        include: { statusHistory: true },
      });
    });
  }

  async remove(id: string) {
    return this.prisma.pipeline.delete({ where: { id } });
  }
}
