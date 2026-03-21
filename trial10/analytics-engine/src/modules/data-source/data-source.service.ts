import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        config: dto.connectionConfig
          ? {
              create: {
                connectionConfig: dto.connectionConfig,
                fieldMapping: dto.fieldMapping ?? {},
                transformSteps: dto.transformSteps ?? [],
                syncSchedule: dto.syncSchedule,
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

  async findOne(id: string, tenantId: string) {
    return this.prisma.dataSource.findUniqueOrThrow({
      where: { id, tenantId },
      include: { config: true, syncRuns: { orderBy: { startedAt: 'desc' } } },
    });
  }

  async update(id: string, tenantId: string, data: Partial<CreateDataSourceDto>) {
    return this.prisma.dataSource.update({
      where: { id, tenantId },
      data: {
        name: data.name,
        type: data.type,
        config: data.connectionConfig
          ? {
              update: {
                connectionConfig: data.connectionConfig,
                fieldMapping: data.fieldMapping,
                transformSteps: data.transformSteps,
                syncSchedule: data.syncSchedule,
              },
            }
          : undefined,
      },
      include: { config: true },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.dataSource.delete({ where: { id, tenantId } });
  }
}
