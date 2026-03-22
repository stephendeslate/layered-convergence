import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  paginate,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PIPELINE_STATUS_TRANSITIONS,
  sanitizeInput,
  maskSensitive,
} from '@analytics-engine/shared';
import type { PipelineStatus } from '@analytics-engine/shared';

// TRACED: AE-API-006
@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
    const take = Math.min(pageSize, MAX_PAGE_SIZE);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { runs: true } },
        },
      }),
      this.prisma.pipeline.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, page, take);
  }

  async findOne(id: string, tenantId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      // findFirst: filtering by id + tenantId for app-level tenant isolation
      where: { id, tenantId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        runs: { orderBy: { startedAt: 'desc' }, take: 10 },
      },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  // TRACED: AE-DB-003
  async create(
    tenantId: string,
    createdById: string,
    data: {
      name: string;
      description?: string;
      schedule?: string;
      config?: Record<string, unknown>;
    },
  ) {
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedDescription = data.description
      ? sanitizeInput(data.description)
      : null;

    // TRACED: AE-SEC-005
    return this.prisma.pipeline.create({
      data: {
        tenantId,
        createdById,
        name: sanitizedName,
        description: sanitizedDescription,
        schedule: data.schedule ?? null,
        config: data.config ?? {},
      },
    });
  }

  // TRACED: AE-API-007
  async updateStatus(id: string, tenantId: string, newStatus: PipelineStatus) {
    const pipeline = await this.findOne(id, tenantId);
    const currentStatus = pipeline.status as PipelineStatus;
    const allowedTransitions = PIPELINE_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const maskedId = maskSensitive(id);
    process.stderr.write(
      `Pipeline ${maskedId} status: ${currentStatus} -> ${newStatus}\n`,
    );

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.pipeline.delete({ where: { id } });
  }
}
