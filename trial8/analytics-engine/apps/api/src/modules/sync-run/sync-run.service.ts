import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SyncRunService {
  private readonly logger = new Logger(SyncRunService.name);

  constructor(private readonly prisma: PrismaService) {}

  async startRun(dataSourceId: string) {
    this.logger.log(`Starting sync run for data source ${dataSourceId}`);
    return this.prisma.syncRun.create({
      data: { dataSourceId, status: 'running' },
    });
  }

  async completeRun(id: string, rowsIngested: number) {
    this.logger.log(`Sync run ${id} completed: ${rowsIngested} rows ingested`);
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: 'completed',
        rowsIngested,
        completedAt: new Date(),
      },
    });
  }

  async failRun(id: string, errorLog: string) {
    this.logger.error(`Sync run ${id} failed: ${errorLog}`);
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: 'failed',
        errorLog,
        completedAt: new Date(),
      },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async findOne(id: string) {
    return this.prisma.syncRun.findUniqueOrThrow({ where: { id } });
  }
}
