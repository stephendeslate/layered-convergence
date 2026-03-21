import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSyncRunDto) {
    return this.prisma.syncRun.create({
      data: {
        pipelineId: dto.pipelineId,
        tenantId,
        status: dto.status ?? 'pending',
        recordCount: dto.recordCount ?? 0,
      },
    });
  }

  async findAll(tenantId: string, pipelineId?: string) {
    return this.prisma.syncRun.findMany({
      where: {
        tenantId,
        ...(pipelineId ? { pipelineId } : {}),
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: justified because we filter by both id and tenantId for tenant isolation
    const syncRun = await this.prisma.syncRun.findFirst({
      where: { id, tenantId },
    });

    if (!syncRun) {
      throw new NotFoundException(`SyncRun with id ${id} not found`);
    }

    return syncRun;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: string,
    extra?: { recordCount?: number; errorLog?: string },
  ) {
    await this.findOne(tenantId, id);

    const data: Record<string, unknown> = { status };

    if (extra?.recordCount !== undefined) {
      data['recordCount'] = extra.recordCount;
    }

    if (extra?.errorLog !== undefined) {
      data['errorLog'] = extra.errorLog;
    }

    if (status === 'completed' || status === 'failed') {
      data['completedAt'] = new Date();
    }

    return this.prisma.syncRun.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.syncRun.delete({ where: { id } });
  }
}
