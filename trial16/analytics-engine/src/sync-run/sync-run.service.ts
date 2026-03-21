import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRunDto, UpdateSyncRunDto } from './sync-run.dto';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSyncRunDto) {
    // Verify data source belongs to tenant — findFirst ensures tenant isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dto.dataSourceId, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return this.prisma.syncRun.create({
      data: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        status: 'pending',
      },
    });
  }

  async findAll(tenantId: string, dataSourceId?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (dataSourceId) {
      where.dataSourceId = dataSourceId;
    }

    return this.prisma.syncRun.findMany({
      where,
      include: { dataSource: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst with tenantId ensures tenant isolation at the application level
    const syncRun = await this.prisma.syncRun.findFirst({
      where: { id, tenantId },
      include: { dataSource: true },
    });

    if (!syncRun) {
      throw new NotFoundException('Sync run not found');
    }

    return syncRun;
  }

  async update(tenantId: string, id: string, dto: UpdateSyncRunDto) {
    await this.findOne(tenantId, id);

    const data: Record<string, unknown> = {};

    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'completed' || dto.status === 'failed') {
        data.completedAt = new Date();
      }
    }

    if (dto.recordsProcessed !== undefined) {
      data.recordsProcessed = dto.recordsProcessed;
    }

    if (dto.errorMessage !== undefined) {
      data.errorMessage = dto.errorMessage;
    }

    return this.prisma.syncRun.update({
      where: { id },
      data,
    });
  }

  async getLatestByDataSource(tenantId: string, dataSourceId: string) {
    // findFirst to get the most recent sync run for a specific data source
    return this.prisma.syncRun.findFirst({
      where: { tenantId, dataSourceId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
