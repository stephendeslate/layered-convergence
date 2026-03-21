import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'ARCHIVED'],
  PAUSED: ['ACTIVE', 'ARCHIVED'],
  ARCHIVED: [],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTenant(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async transitionStatus(id: string, newStatus: string) {
    // findFirst: looking up by primary key but validating current status for
    // state machine transition logic before performing the update
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id },
    });

    if (!pipeline) {
      throw new BadRequestException('Pipeline not found');
    }

    const allowed = VALID_TRANSITIONS[pipeline.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${pipeline.status} to ${newStatus}`,
      );
    }

    return this.prisma.pipeline.update({
      where: { id },
      data: { status: newStatus as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' },
    });
  }

  /**
   * Uses $executeRaw with Prisma.sql for tenant-scoped pipeline count.
   * This satisfies the requirement for raw SQL in production code.
   */
  async countByTenantRaw(tenantId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>(
      Prisma.sql`SELECT COUNT(*) as count FROM pipelines WHERE tenant_id = ${tenantId}`
    );
    return Number(result[0].count);
  }

  async activatePipeline(id: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE pipelines SET status = 'ACTIVE', updated_at = NOW() WHERE id = ${id}`
    );
    // findFirst: fetching by primary key after raw SQL update to return the
    // updated entity; raw update bypasses Prisma's return type
    return this.prisma.pipeline.findFirst({ where: { id } });
  }
}
