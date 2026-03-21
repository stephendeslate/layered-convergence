import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDataSourceDto, UpdateDataSourceDto, ConfigureDataSourceDto } from './data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        config: dto.config
          ? {
              create: {
                connectionConfig: dto.config.connectionConfig ?? {},
                fieldMapping: dto.config.fieldMapping ?? {},
                transformSteps: dto.config.transformSteps ?? [],
                syncSchedule: dto.config.syncSchedule,
              },
            }
          : undefined,
      },
      include: { config: true },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { config: true, syncRuns: { take: 5, orderBy: { startedAt: 'desc' } } },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.dataSource.findFirstOrThrow({
      where: { id, tenantId },
      include: { config: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    await this.prisma.dataSource.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dataSource.update({
      where: { id },
      data: { name: dto.name, type: dto.type },
      include: { config: true },
    });
  }

  async configure(tenantId: string, id: string, dto: ConfigureDataSourceDto) {
    const ds = await this.prisma.dataSource.findFirstOrThrow({
      where: { id, tenantId },
      include: { config: true },
    });

    if (ds.config) {
      return this.prisma.dataSourceConfig.update({
        where: { dataSourceId: id },
        data: {
          connectionConfig: dto.connectionConfig ?? ds.config.connectionConfig,
          fieldMapping: dto.fieldMapping ?? ds.config.fieldMapping,
          transformSteps: dto.transformSteps ?? ds.config.transformSteps,
          syncSchedule: dto.syncSchedule ?? ds.config.syncSchedule,
        },
      });
    }

    return this.prisma.dataSourceConfig.create({
      data: {
        dataSourceId: id,
        connectionConfig: dto.connectionConfig ?? {},
        fieldMapping: dto.fieldMapping ?? {},
        transformSteps: dto.transformSteps ?? [],
        syncSchedule: dto.syncSchedule,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.dataSource.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
