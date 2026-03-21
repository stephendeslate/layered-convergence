import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncRunDto } from './dto/create-sync-run.dto';
import { UpdateSyncRunStatusDto } from './dto/update-sync-run-status.dto';
import { VALID_TRANSITIONS } from '../common/constants/transitions';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSyncRunDto) {
    return this.prisma.syncRun.create({
      data: {
        dataSourceId: dto.dataSourceId,
        status: 'pending',
      },
    });
  }

  async findAll(dataSourceId?: string) {
    return this.prisma.syncRun.findMany({
      where: dataSourceId ? { dataSourceId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.syncRun.findUniqueOrThrow({ where: { id } });
  }

  async updateStatus(id: string, dto: UpdateSyncRunStatusDto) {
    const current = await this.prisma.syncRun.findUniqueOrThrow({ where: { id } });
    const allowed = VALID_TRANSITIONS[current.status] || [];

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from '${current.status}' to '${dto.status}'`,
      );
    }

    const updateData: Record<string, unknown> = { status: dto.status };

    if (dto.status === 'running') {
      updateData.startedAt = new Date();
    }
    if (dto.status === 'completed' || dto.status === 'failed') {
      updateData.completedAt = new Date();
    }
    if (dto.rowsIngested !== undefined) {
      updateData.rowsIngested = dto.rowsIngested;
    }
    if (dto.errorLog !== undefined) {
      updateData.errorLog = dto.errorLog;
    }

    return this.prisma.syncRun.update({
      where: { id },
      data: updateData,
    });
  }

  async getHistory(dataSourceId: string, limit = 20) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async remove(id: string) {
    return this.prisma.syncRun.delete({ where: { id } });
  }
}
