import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TriggerSyncDto } from './dto/trigger-sync.dto';
import { SyncHistoryQueryDto } from './dto/sync-history-query.dto';
import { SyncRunStatus } from '@prisma/client';

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async triggerSync(dto: TriggerSyncDto) {
    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId: dto.dataSourceId,
        status: SyncRunStatus.RUNNING,
      },
    });

    // In production, this would enqueue a BullMQ job.
    // For the demo, simulate completion.
    const completed = await this.prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: SyncRunStatus.COMPLETED,
        rowsIngested: Math.floor(Math.random() * 500) + 50,
        completedAt: new Date(),
      },
    });

    return completed;
  }

  async getHistory(query: SyncHistoryQueryDto) {
    return this.prisma.syncRun.findMany({
      where: {
        ...(query.dataSourceId ? { dataSourceId: query.dataSourceId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: query.limit ?? 20,
      include: { dataSource: true },
    });
  }

  async getRunById(id: string) {
    return this.prisma.syncRun.findFirstOrThrow({
      where: { id },
      include: { dataSource: true },
    });
  }
}
