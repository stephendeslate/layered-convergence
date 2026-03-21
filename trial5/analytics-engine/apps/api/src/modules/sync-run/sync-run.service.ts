import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncRunStatus } from '@prisma/client';
import { TriggerSyncDto } from './dto/trigger-sync.dto';

@Injectable()
export class SyncRunService {
  private readonly logger = new Logger(SyncRunService.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerSync(dto: TriggerSyncDto) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dto.dataSourceId },
      include: { config: true },
    });

    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId: dto.dataSourceId,
        status: SyncRunStatus.RUNNING,
      },
    });

    // Trigger async ingestion job (in production, this would enqueue a BullMQ job)
    this.logger.log(`Sync run ${syncRun.id} started for data source ${dataSource.name}`);

    return syncRun;
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async findById(id: string) {
    return this.prisma.syncRun.findUniqueOrThrow({
      where: { id },
    });
  }

  async markCompleted(id: string, rowsIngested: number) {
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: SyncRunStatus.COMPLETED,
        rowsIngested,
        completedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, errorLog: string) {
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: SyncRunStatus.FAILED,
        errorLog,
        completedAt: new Date(),
      },
    });
  }
}
