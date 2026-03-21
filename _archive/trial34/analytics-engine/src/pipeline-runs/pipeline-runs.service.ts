import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineRunDto } from './dto/create-pipeline-run.dto';

@Injectable()
export class PipelineRunsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pipelineId: string) {
    return this.prisma.pipelineRun.findMany({
      where: { pipelineId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const run = await this.prisma.pipelineRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundException('Pipeline run not found');
    return run;
  }

  async create(dto: CreatePipelineRunDto) {
    return this.prisma.pipelineRun.create({
      data: {
        pipelineId: dto.pipelineId,
        status: 'running',
      },
    });
  }

  async complete(id: string, rowsIngested: number) {
    return this.prisma.pipelineRun.update({
      where: { id },
      data: {
        status: 'completed',
        rowsIngested,
        completedAt: new Date(),
      },
    });
  }

  async fail(id: string, errorLog: string) {
    return this.prisma.pipelineRun.update({
      where: { id },
      data: {
        status: 'failed',
        errorLog,
        completedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.pipelineRun.delete({ where: { id } });
  }
}
