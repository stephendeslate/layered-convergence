// TRACED: AE-PIPE-003 — Pipelines service with status transitions
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, generateId, PIPELINE_STATUS_TRANSITIONS, PipelineStatus } from '@analytics-engine/shared';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, data: { name: string; source: string; schedule?: string }) {
    return this.prisma.pipeline.create({
      data: {
        id: generateId('pipe'),
        name: data.name,
        source: data.source,
        schedule: data.schedule,
        status: 'DRAFT',
        tenantId,
        createdById: userId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { tenantId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pipeline.count({ where: { tenantId } }),
    ]);
    return paginate(items, total, page, pageSize);
  }

  async updateStatus(tenantId: string, id: string, newStatus: string) {
    // findFirst: scoping by tenantId for multi-tenant isolation
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, tenantId },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const allowed = PIPELINE_STATUS_TRANSITIONS[pipeline.status as PipelineStatus];
    if (!allowed?.includes(newStatus as PipelineStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${pipeline.status} to ${newStatus}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
