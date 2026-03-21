// [TRACED:AC-008] SyncRun CRUD with tenant isolation
// [TRACED:AC-009] SyncRun state machine with validated transitions
// [TRACED:PV-002] SyncRun state machine: PENDING -> RUNNING -> SUCCESS/FAILED

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncRunStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<SyncRunStatus, SyncRunStatus[]> = {
  [SyncRunStatus.PENDING]: [SyncRunStatus.RUNNING],
  [SyncRunStatus.RUNNING]: [SyncRunStatus.SUCCESS, SyncRunStatus.FAILED],
  [SyncRunStatus.SUCCESS]: [],
  [SyncRunStatus.FAILED]: [],
};

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { dataSourceId: string; tenantId: string }) {
    return this.prisma.syncRun.create({
      data: {
        dataSourceId: data.dataSourceId,
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.syncRun.findMany({
      where: { tenantId },
      include: { dataSource: true },
    });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId (no unique constraint on this composite)
    const syncRun = await this.prisma.syncRun.findFirst({
      where: { id, tenantId },
      include: { dataSource: true },
    });

    if (!syncRun) {
      throw new NotFoundException('SyncRun not found');
    }

    return syncRun;
  }

  async transition(id: string, tenantId: string, newStatus: SyncRunStatus, errorMessage?: string) {
    const syncRun = await this.findOne(id, tenantId);

    const allowedTransitions = VALID_TRANSITIONS[syncRun.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${syncRun.status} to ${newStatus}`,
      );
    }

    const updateData: {
      status: SyncRunStatus;
      startedAt?: Date;
      completedAt?: Date;
      errorMessage?: string;
    } = { status: newStatus };

    if (newStatus === SyncRunStatus.RUNNING) {
      updateData.startedAt = new Date();
    }

    if (newStatus === SyncRunStatus.SUCCESS || newStatus === SyncRunStatus.FAILED) {
      updateData.completedAt = new Date();
    }

    if (newStatus === SyncRunStatus.FAILED && errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return this.prisma.syncRun.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.syncRun.delete({
      where: { id },
    });
  }
}
