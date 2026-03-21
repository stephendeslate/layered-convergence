import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SyncRunStatus } from '@prisma/client';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dataSourceId: string) {
    return this.prisma.syncRun.create({
      data: { dataSourceId, status: SyncRunStatus.RUNNING },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.syncRun.findFirstOrThrow({ where: { id } });
  }

  async complete(id: string, rowsIngested: number) {
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: SyncRunStatus.COMPLETED,
        rowsIngested,
        completedAt: new Date(),
      },
    });
  }

  async fail(id: string, errorLog: string) {
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
