import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SyncRunService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDataSource(tenantId: string, dataSourceId: string) {
    await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, tenantId },
    });

    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async findById(tenantId: string, id: string) {
    const syncRun = await this.prisma.syncRun.findFirstOrThrow({
      where: { id },
      include: { dataSource: true },
    });

    if (syncRun.dataSource.tenantId !== tenantId) {
      throw new Error('Sync run not found for this tenant');
    }

    return syncRun;
  }

  async getStats(tenantId: string) {
    const dataSources = await this.prisma.dataSource.findMany({
      where: { tenantId },
      select: { id: true },
    });

    const dataSourceIds = dataSources.map((ds) => ds.id);

    const [total, completed, failed, running] = await Promise.all([
      this.prisma.syncRun.count({ where: { dataSourceId: { in: dataSourceIds } } }),
      this.prisma.syncRun.count({ where: { dataSourceId: { in: dataSourceIds }, status: 'COMPLETED' } }),
      this.prisma.syncRun.count({ where: { dataSourceId: { in: dataSourceIds }, status: 'FAILED' } }),
      this.prisma.syncRun.count({ where: { dataSourceId: { in: dataSourceIds }, status: 'RUNNING' } }),
    ]);

    return { total, completed, failed, running };
  }
}
