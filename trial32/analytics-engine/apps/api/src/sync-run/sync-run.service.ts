// [TRACED:AE-AC-008] SyncRun CRUD with tenant isolation
// [TRACED:AE-AC-009] SyncRun state machine validation
// [TRACED:AE-PV-002] SyncRun state machine
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncRunStatus } from '@prisma/client';
import { validateTransition, SYNC_RUN_TRANSITIONS } from '@analytics-engine/shared';

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
    return this.prisma.syncRun.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId for tenant isolation
    const syncRun = await this.prisma.syncRun.findFirst({
      where: { id, tenantId },
    });

    if (!syncRun) {
      throw new NotFoundException('SyncRun not found');
    }

    return syncRun;
  }

  async transition(id: string, tenantId: string, newStatus: SyncRunStatus) {
    const syncRun = await this.findOne(id, tenantId);

    try {
      validateTransition(syncRun.status, newStatus, SYNC_RUN_TRANSITIONS);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid transition';
      throw new BadRequestException(message);
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === SyncRunStatus.RUNNING) {
      updateData.startedAt = new Date();
    }
    if (newStatus === SyncRunStatus.COMPLETED || newStatus === SyncRunStatus.FAILED) {
      updateData.completedAt = new Date();
    }

    return this.prisma.syncRun.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.syncRun.delete({ where: { id } });
  }
}
