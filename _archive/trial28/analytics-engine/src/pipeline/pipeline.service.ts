import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SyncRunStatus } from './dto/update-sync-run.dto.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  RUNNING: ['COMPLETED', 'FAILED'],
};

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async startSync(tenantId: string, dataSourceId: string) {
    // findFirst: scoped by tenantId + dataSourceId — ensures tenant isolation
    const ds = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });
    if (!ds) {
      throw new NotFoundException('DataSource not found');
    }

    return this.prisma.syncRun.create({
      data: {
        dataSourceId,
        status: 'RUNNING',
      },
    });
  }

  async updateSyncStatus(
    id: string,
    status: SyncRunStatus,
    rowsIngested?: number,
    errorLog?: string,
  ) {
    const syncRun = await this.prisma.syncRun.findUnique({ where: { id } });
    if (!syncRun) {
      throw new NotFoundException('SyncRun not found');
    }

    const allowed = VALID_TRANSITIONS[syncRun.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(
        `Invalid state transition from ${syncRun.status} to ${status}`,
      );
    }

    const data: any = { status };
    if (status === 'COMPLETED' || status === 'FAILED') {
      data.completedAt = new Date();
    }
    if (rowsIngested !== undefined) {
      data.rowsIngested = rowsIngested;
    }
    if (errorLog !== undefined) {
      data.errorLog = errorLog;
    }

    return this.prisma.syncRun.update({
      where: { id },
      data,
    });
  }

  async getSyncRuns(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSyncRun(id: string) {
    const syncRun = await this.prisma.syncRun.findUnique({ where: { id } });
    if (!syncRun) {
      throw new NotFoundException('SyncRun not found');
    }
    return syncRun;
  }

  async createDeadLetterEvent(
    dataSourceId: string,
    payload: Record<string, any>,
    errorReason: string,
  ) {
    return this.prisma.deadLetterEvent.create({
      data: { dataSourceId, payload, errorReason },
    });
  }

  async getDeadLetterEvents(dataSourceId: string) {
    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async retryDeadLetterEvent(id: string) {
    const event = await this.prisma.deadLetterEvent.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException('DeadLetterEvent not found');
    }
    return this.prisma.deadLetterEvent.update({
      where: { id },
      data: { retriedAt: new Date() },
    });
  }
}
