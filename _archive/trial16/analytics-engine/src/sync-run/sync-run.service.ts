import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dataSourceId: string) {
    return this.prisma.syncRun.create({
      data: {
        dataSourceId,
        status: 'running',
      },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const run = await this.prisma.syncRun.findUnique({ where: { id } });
    if (!run) {
      throw new NotFoundException('Sync run not found');
    }
    return run;
  }

  async complete(id: string, rowsIngested: number) {
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: 'completed',
        rowsIngested,
        completedAt: new Date(),
      },
    });
  }

  async fail(id: string, errorLog: string) {
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: 'failed',
        errorLog,
        completedAt: new Date(),
      },
    });
  }
}
