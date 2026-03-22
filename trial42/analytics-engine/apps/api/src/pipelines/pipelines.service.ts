import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto, UpdatePipelineDto } from './pipelines.dto';
import { clampPageSize, calculateSkip } from '@analytics-engine/shared';

// TRACED:AE-API-011
@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        description: dto.description,
        schedule: dto.schedule,
        config: dto.config ?? {},
        processingCost: dto.processingCost,
        dataSourceId: dto.dataSourceId,
        tenantId: dto.tenantId,
      },
      include: { dataSource: { select: { id: true, name: true } } },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const size = clampPageSize(pageSize);
    const skip = calculateSkip(page, size);

    const [data, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { tenantId },
        skip,
        take: size,
        include: { dataSource: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pipeline.count({ where: { tenantId } }),
    ]);

    return { data, total, page: page ?? 1, pageSize: size };
  }

  async findOne(id: string) {
    // findFirst: include dataSource relation for detail view
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id },
      include: { dataSource: { select: { id: true, name: true, type: true } } },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  async update(id: string, dto: UpdatePipelineDto) {
    await this.findOne(id);
    return this.prisma.pipeline.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as 'ACTIVE' | 'PAUSED' | 'FAILED' | 'DISABLED' | undefined,
      },
      include: { dataSource: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pipeline.delete({ where: { id } });
  }
}
