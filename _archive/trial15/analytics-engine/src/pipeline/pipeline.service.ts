import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncRunService } from '../sync-run/sync-run.service';
import { PipelineStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  IDLE: [PipelineStatus.RUNNING],
  RUNNING: [PipelineStatus.COMPLETED, PipelineStatus.FAILED],
  COMPLETED: [PipelineStatus.RUNNING],
  FAILED: [PipelineStatus.RUNNING],
};

@Injectable()
export class PipelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syncRunService: SyncRunService,
  ) {}

  async getStatus(dataSourceId: string) {
    const ds = await this.prisma.dataSource.findUnique({ where: { id: dataSourceId } });
    if (!ds) {
      throw new NotFoundException('Data source not found');
    }
    return { id: ds.id, status: ds.status };
  }

  async transition(dataSourceId: string, targetStatus: PipelineStatus) {
    const ds = await this.prisma.dataSource.findUnique({ where: { id: dataSourceId } });
    if (!ds) {
      throw new NotFoundException('Data source not found');
    }

    const allowed = VALID_TRANSITIONS[ds.status];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${ds.status} to ${targetStatus}`,
      );
    }

    return this.prisma.dataSource.update({
      where: { id: dataSourceId },
      data: { status: targetStatus },
    });
  }

  async trigger(tenantId: string, dataSourceId: string) {
    const ds = await this.prisma.dataSource.findUnique({ where: { id: dataSourceId } });
    if (!ds || ds.tenantId !== tenantId) {
      throw new NotFoundException('Data source not found');
    }

    await this.transition(dataSourceId, PipelineStatus.RUNNING);
    const syncRun = await this.syncRunService.create(dataSourceId);

    return { dataSourceId, syncRunId: syncRun.id, status: 'RUNNING' };
  }

  async complete(dataSourceId: string, syncRunId: string, rowsIngested: number) {
    await this.transition(dataSourceId, PipelineStatus.COMPLETED);
    await this.syncRunService.complete(syncRunId, rowsIngested);
    return { dataSourceId, status: 'COMPLETED', rowsIngested };
  }

  async fail(dataSourceId: string, syncRunId: string, errorLog: string) {
    await this.transition(dataSourceId, PipelineStatus.FAILED);
    await this.syncRunService.fail(syncRunId, errorLog);
    return { dataSourceId, status: 'FAILED', errorLog };
  }
}
