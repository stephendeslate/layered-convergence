// TRACED:AE-API-06 — PipelinesService with select for list, include for detail
// TRACED:AE-PERF-11 — Pipeline queries use select/include; N+1 prevention via include

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { paginate, PageParams } from '@analytics-engine/shared';

interface FindAllParams extends PageParams {
  tenantId?: string;
  status?: string;
}

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        description: dto.description,
        schedule: dto.schedule,
        tenantId: dto.tenantId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        schedule: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async findAll(params: FindAllParams) {
    const { skip, take } = paginate(params);

    const where: Prisma.PipelineWhereInput = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.status) where.status = params.status as Prisma.EnumPipelineStatusFilter;

    const [data, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          schedule: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pipeline.count({ where }),
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

  async findOne(id: string) {
    // findFirst: lookup by primary key — allows future tenant-scoping addition
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id },
      include: {
        runs: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            errorMsg: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }

    return pipeline;
  }

  async update(id: string, dto: UpdatePipelineDto) {
    await this.findOne(id);

    return this.prisma.pipeline.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.schedule !== undefined && { schedule: dto.schedule }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        schedule: true,
        tenantId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.pipeline.delete({ where: { id } });
  }
}
