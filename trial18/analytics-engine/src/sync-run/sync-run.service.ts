import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRunDto, UpdateSyncRunDto } from './sync-run.dto';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, dataSourceId?: string) {
    return this.prisma.syncRun.findMany({
      where: {
        tenantId,
        ...(dataSourceId ? { dataSourceId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: filtering by tenantId + id for tenant isolation
    const syncRun = await this.prisma.syncRun.findFirst({
      where: { id, tenantId },
    });

    if (!syncRun) {
      throw new NotFoundException('Sync run not found');
    }

    return syncRun;
  }

  async create(tenantId: string, dto: CreateSyncRunDto) {
    return this.prisma.syncRun.create({
      data: {
        tenantId,
        dataSourceId: dto.dataSourceId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSyncRunDto) {
    await this.findOne(tenantId, id);

    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: dto.status,
        recordsProcessed: dto.recordsProcessed,
        errorMessage: dto.errorMessage,
        completedAt: dto.status === 'completed' || dto.status === 'failed' ? new Date() : undefined,
      },
    });
  }
}
