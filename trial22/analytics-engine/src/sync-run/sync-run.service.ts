// [TRACED:AC-017] SyncRun service with state machine transitions
// [TRACED:PV-002] SyncRun state machine: PENDING -> RUNNING -> SUCCESS/FAILED

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncRun, SyncRunStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<SyncRunStatus, SyncRunStatus[]> = {
  [SyncRunStatus.PENDING]: [SyncRunStatus.RUNNING],
  [SyncRunStatus.RUNNING]: [SyncRunStatus.SUCCESS, SyncRunStatus.FAILED],
  [SyncRunStatus.SUCCESS]: [],
  [SyncRunStatus.FAILED]: [],
};

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<SyncRun[]> {
    return this.prisma.syncRun.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDataSource(
    dataSourceId: string,
    tenantId: string,
  ): Promise<SyncRun[]> {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    data: { dataSourceId: string; tenantId: string },
  ): Promise<SyncRun> {
    return this.prisma.syncRun.create({ data });
  }

  async transition(
    id: string,
    tenantId: string,
    newStatus: SyncRunStatus,
    error?: string,
  ): Promise<SyncRun> {
    const syncRun = await this.prisma.syncRun.findFirst({
      where: { id, tenantId },
    });

    if (!syncRun) {
      throw new BadRequestException('SyncRun not found');
    }

    const allowed = VALID_TRANSITIONS[syncRun.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${syncRun.status} to ${newStatus}`,
      );
    }

    const updateData: {
      status: SyncRunStatus;
      startedAt?: Date;
      completedAt?: Date;
      error?: string;
    } = { status: newStatus };

    if (newStatus === SyncRunStatus.RUNNING) {
      updateData.startedAt = new Date();
    }

    if (
      newStatus === SyncRunStatus.SUCCESS ||
      newStatus === SyncRunStatus.FAILED
    ) {
      updateData.completedAt = new Date();
    }

    if (error) {
      updateData.error = error;
    }

    return this.prisma.syncRun.update({
      where: { id },
      data: updateData,
    });
  }
}
