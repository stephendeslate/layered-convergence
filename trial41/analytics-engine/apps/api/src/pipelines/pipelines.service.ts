// TRACED:AE-PIPELINES-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { normalizePageParams } from '@analytics-engine/shared';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: (dto.status as 'ACTIVE' | 'PAUSED' | 'ERROR' | 'DISABLED') ?? 'ACTIVE',
        cost: dto.cost ?? 0,
        tenantId,
        dataSourceId: dto.dataSourceId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        cost: true,
        tenantId: true,
        dataSourceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          cost: true,
          tenantId: true,
          dataSourceId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.pipeline.count({ where: { tenantId } }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst justified: fetching by ID scoped to tenant for authorization
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        config: true,
        cost: true,
        tenantId: true,
        dataSourceId: true,
        dataSource: {
          select: { id: true, name: true, type: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async update(id: string, tenantId: string, dto: UpdatePipelineDto) {
    await this.findOne(id, tenantId);
    return this.prisma.pipeline.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && {
          status: dto.status as 'ACTIVE' | 'PAUSED' | 'ERROR' | 'DISABLED',
        }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.dataSourceId !== undefined && { dataSourceId: dto.dataSourceId }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        cost: true,
        tenantId: true,
        dataSourceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.pipeline.delete({ where: { id } });
    return { deleted: true };
  }
}
