import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';
import { SyncStatus } from '@prisma/client';

@Injectable()
export class SyncRunService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findByDataSource(dataSourceId: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.syncRun.findMany({
      where: { dataSourceId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    // findUnique for primary key lookup
    const syncRun = await this.prisma.syncRun.findUnique({
      where: { id },
    });
    if (!syncRun || syncRun.tenantId !== tenantId) {
      throw new NotFoundException('Sync run not found');
    }
    return syncRun;
  }

  async create(dto: CreateSyncRunDto, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.syncRun.create({
      data: {
        dataSourceId: dto.dataSourceId,
        tenantId,
        status: SyncStatus.PENDING,
      },
    });
  }

  async updateStatus(id: string, status: SyncStatus, tenantId: string, error?: string) {
    await this.findById(id, tenantId);
    const data: Record<string, unknown> = { status };
    if (status === SyncStatus.RUNNING) {
      data.startedAt = new Date();
    }
    if (status === SyncStatus.SUCCESS || status === SyncStatus.FAILED) {
      data.completedAt = new Date();
    }
    if (error) {
      data.error = error;
    }
    return this.prisma.syncRun.update({
      where: { id },
      data,
    });
  }
}
