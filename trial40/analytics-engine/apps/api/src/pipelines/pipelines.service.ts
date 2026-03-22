// TRACED:AE-API-07 — Pipelines CRUD service with Prisma select/include
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams, paginate, PaginatedResult } from '@analytics-engine/shared';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePipelineDto): Promise<Record<string, unknown>> {
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: (dto.status as 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED') || 'IDLE',
        schedule: dto.schedule,
        tenantId: dto.tenantId,
        dataSourceId: dto.dataSourceId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        tenantId: true,
        dataSourceId: true,
        createdAt: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const params = normalizePageParams(page, pageSize);
    const { skip, take } = paginate(params);

    const [data, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          status: true,
          schedule: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pipeline.count({ where: { tenantId } }),
    ]);

    return {
      data,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    // findFirst justified: lookup by primary key for detail endpoint
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id },
      include: {
        tenant: { select: { id: true, name: true } },
        dataSource: { select: { id: true, name: true, type: true } },
      },
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }

    return pipeline;
  }

  async update(id: string, dto: UpdatePipelineDto): Promise<Record<string, unknown>> {
    await this.findOne(id);

    return this.prisma.pipeline.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status as 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED' }),
        ...(dto.schedule !== undefined && { schedule: dto.schedule }),
      },
      select: {
        id: true,
        name: true,
        status: true,
        schedule: true,
        tenantId: true,
        dataSourceId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.prisma.pipeline.delete({ where: { id } });
    return { deleted: true };
  }
}
