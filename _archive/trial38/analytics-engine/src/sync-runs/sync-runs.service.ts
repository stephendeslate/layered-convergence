import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';
import { SyncStatus } from '@prisma/client';

@Injectable()
export class SyncRunsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSyncRunDto) {
    return this.prisma.syncRun.create({
      data: {
        dataSourceId: dto.dataSourceId,
        status: SyncStatus.RUNNING,
      },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const run = await this.prisma.syncRun.findUnique({ where: { id } });
    if (!run) {
      throw new NotFoundException(`SyncRun ${id} not found`);
    }
    return run;
  }

  async complete(id: string, rowsIngested: number) {
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: SyncStatus.COMPLETED,
        rowsIngested,
        completedAt: new Date(),
      },
    });
  }

  async fail(id: string, errorLog: string) {
    return this.prisma.syncRun.update({
      where: { id },
      data: {
        status: SyncStatus.FAILED,
        errorLog,
        completedAt: new Date(),
      },
    });
  }
}
