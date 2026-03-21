import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRunDto, UpdateSyncRunDto } from './sync-run.dto';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSyncRunDto) {
    return this.prisma.syncRun.create({
      data: {
        dataSourceId: dto.dataSourceId,
        status: dto.status ?? 'running',
      },
    });
  }

  async findByDataSourceId(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const run = await this.prisma.syncRun.findFirst({
      where: { id },
    });

    if (!run) {
      throw new NotFoundException('Sync run not found');
    }

    return run;
  }

  async update(id: string, dto: UpdateSyncRunDto) {
    await this.findOne(id);

    return this.prisma.syncRun.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === 'completed' || dto.status === 'failed'
          ? { completedAt: new Date() }
          : {}),
      },
    });
  }
}
