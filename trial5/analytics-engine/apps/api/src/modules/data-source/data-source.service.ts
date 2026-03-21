import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DataSourceType } from '@prisma/client';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        type: dto.type,
        config: dto.config
          ? {
              create: {
                connectionConfig: dto.config.connectionConfig || {},
                fieldMapping: dto.config.fieldMapping || {},
                transformSteps: dto.config.transformSteps || [],
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

  async findById(id: string) {
    return this.prisma.dataSource.findUniqueOrThrow({
      where: { id },
      include: { config: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    await this.prisma.dataSource.findUniqueOrThrow({ where: { id } });
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        name: dto.name,
        config: dto.config
          ? {
              upsert: {
                create: {
                  connectionConfig: dto.config.connectionConfig || {},
                  fieldMapping: dto.config.fieldMapping || {},
                  transformSteps: dto.config.transformSteps || [],
                  syncSchedule: dto.config.syncSchedule,
                },
                update: {
                  connectionConfig: dto.config.connectionConfig,
                  fieldMapping: dto.config.fieldMapping,
                  transformSteps: dto.config.transformSteps,
                  syncSchedule: dto.config.syncSchedule,
                },
              },
            }
          : undefined,
      },
      include: { config: true },
    });
  }

  async delete(id: string) {
    await this.prisma.dataSource.findUniqueOrThrow({ where: { id } });
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
