import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SyncRunStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRunDto, TransitionSyncRunDto } from './sync-run.dto';

const VALID_SYNC_TRANSITIONS: Record<SyncRunStatus, SyncRunStatus[]> = {
  [SyncRunStatus.PENDING]: [SyncRunStatus.RUNNING],
  [SyncRunStatus.RUNNING]: [SyncRunStatus.COMPLETED, SyncRunStatus.FAILED],
  [SyncRunStatus.COMPLETED]: [],
  [SyncRunStatus.FAILED]: [],
};

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

  async transition(tenantId: string, id: string, dto: TransitionSyncRunDto) {
    const syncRun = await this.findOne(tenantId, id);
    const currentStatus = syncRun.status;
    const targetStatus = dto.status;

    const allowedTransitions = VALID_SYNC_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition sync run from ${currentStatus} to ${targetStatus}. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }

    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: targetStatus,
        recordsProcessed: dto.recordsProcessed,
        errorMessage: dto.errorMessage,
        completedAt: targetStatus === SyncRunStatus.COMPLETED || targetStatus === SyncRunStatus.FAILED
          ? new Date()
          : undefined,
      },
    });
  }
}
