// TRACED: AE-API-06
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { sanitizeInput } from '@analytics-engine/shared';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        name: sanitizeInput(dto.name),
        description: dto.description ? sanitizeInput(dto.description) : null,
        schedule: dto.schedule ?? null,
        tenantId,
        createdBy: userId,
      },
    });
  }

  async findAll(tenantId: string) {
    const [items, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        include: { runs: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
      this.prisma.pipeline.count({
        where: { tenantId },
      }),
    ]);

    return { items, total };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by both id and tenantId for tenant isolation (not just unique id)
    return this.prisma.pipeline.findFirst({
      where: { id, tenantId },
      include: { runs: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
  }

  async update(id: string, dto: UpdatePipelineDto) {
    const data: Record<string, string | null> = {};

    if (dto.name !== undefined) {
      data.name = sanitizeInput(dto.name);
    }

    if (dto.description !== undefined) {
      data.description = sanitizeInput(dto.description);
    }

    if (dto.schedule !== undefined) {
      data.schedule = dto.schedule;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    return this.prisma.pipeline.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.pipeline.delete({
      where: { id },
    });
  }
}
