import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { DataSourceType, PipelineStatus } from '@prisma/client';
import { validatePipelineTransition } from '../pipelines/pipeline-state-machine';

@Injectable()
export class DataSourcesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        type: dto.type as DataSourceType,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { dataSourceConfig: true },
    });
  }

  async findById(id: string) {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { dataSourceConfig: true, syncRuns: { orderBy: { startedAt: 'desc' }, take: 10 } },
    });
    if (!dataSource) {
      throw new NotFoundException(`DataSource ${id} not found`);
    }
    return dataSource;
  }

  async updateStatus(id: string, newStatus: PipelineStatus) {
    const dataSource = await this.findById(id);
    validatePipelineTransition(dataSource.pipelineStatus, newStatus);

    return this.prisma.dataSource.update({
      where: { id },
      data: { pipelineStatus: newStatus },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    if (dto.pipelineStatus) {
      return this.updateStatus(id, dto.pipelineStatus as PipelineStatus);
    }
    return this.prisma.dataSource.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
