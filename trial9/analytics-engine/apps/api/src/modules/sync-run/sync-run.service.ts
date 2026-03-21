import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SyncRunService {
  private readonly logger = new Logger(SyncRunService.name);

  constructor(private readonly prisma: PrismaService) {}

  async start(dataSourceId: string) {
    const run = await this.prisma.syncRun.create({
      data: { dataSourceId, status: 'running' },
    });
    this.logger.log(`Sync run started: ${run.id} for source ${dataSourceId}`);
    return run;
  }

  async complete(id: string, rowsIngested: number) {
    return this.prisma.syncRun.update({
      where: { id },
      data: { status: 'completed', rowsIngested, completedAt: new Date() },
    });
  }

  async fail(id: string, errorLog: string) {
    this.logger.error(`Sync run failed: ${id} — ${errorLog}`);
    return this.prisma.syncRun.update({
      where: { id },
      data: { status: 'failed', errorLog, completedAt: new Date() },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async findById(id: string) {
    return this.prisma.syncRun.findUniqueOrThrow({ where: { id } });
  }
}
