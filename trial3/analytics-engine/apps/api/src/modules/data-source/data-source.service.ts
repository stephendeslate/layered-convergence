import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isValidConnectorType } from '@analytics-engine/shared';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; type: string }) {
    if (!isValidConnectorType(data.type)) {
      throw new Error(`Invalid connector type: ${data.type}`);
    }
    await this.prisma.tenant.findFirstOrThrow({ where: { id: tenantId } });
    return this.prisma.dataSource.create({
      data: { ...data, tenantId },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { config: true },
    });
  }

  async findByIdAndTenant(id: string, tenantId: string) {
    return this.prisma.dataSource.findFirstOrThrow({
      where: { id, tenantId },
      include: { config: true },
    });
  }

  async update(id: string, tenantId: string, data: { name?: string; isActive?: boolean }) {
    await this.prisma.dataSource.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dataSource.update({ where: { id }, data });
  }

  async delete(id: string, tenantId: string) {
    await this.prisma.dataSource.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dataSource.delete({ where: { id } });
  }

  async setConfig(id: string, tenantId: string, config: {
    connectionConfig?: Record<string, unknown>;
    fieldMapping?: Record<string, unknown>;
    transformSteps?: Record<string, unknown>[];
    syncSchedule?: string;
  }) {
    const ds = await this.prisma.dataSource.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dataSourceConfig.upsert({
      where: { dataSourceId: ds.id },
      create: { dataSourceId: ds.id, ...config },
      update: config,
    });
  }

  async findByWebhookToken(webhookToken: string) {
    return this.prisma.dataSource.findFirstOrThrow({
      where: { webhookToken, isActive: true },
      include: { config: true },
    });
  }

  async getSyncHistory(id: string, tenantId: string) {
    await this.prisma.dataSource.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.syncRun.findMany({
      where: { dataSourceId: id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
