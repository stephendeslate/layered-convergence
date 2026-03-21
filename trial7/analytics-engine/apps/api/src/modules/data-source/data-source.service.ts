import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.$transaction(async (tx) => {
      const dataSource = await tx.dataSource.create({
        data: {
          tenantId,
          name: dto.name,
          type: dto.type,
        },
      });

      await tx.dataSourceConfig.create({
        data: {
          dataSourceId: dataSource.id,
          connectionConfig: dto.connectionConfig
            ? toJsonField(dto.connectionConfig)
            : undefined,
          fieldMapping: dto.fieldMapping
            ? toJsonField(dto.fieldMapping)
            : undefined,
          syncSchedule: dto.syncSchedule,
        },
      });

      return this.findOneOrThrow(tenantId, dataSource.id);
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { config: true, syncRuns: { take: 5, orderBy: { startedAt: 'desc' } } },
    });
  }

  async findOneOrThrow(tenantId: string, id: string) {
    return this.prisma.dataSource.findFirstOrThrow({
      where: { id, tenantId },
      include: { config: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    const dataSource = await this.prisma.dataSource.findFirstOrThrow({
      where: { id, tenantId },
      include: { config: true },
    });

    if (dto.name) {
      await this.prisma.dataSource.update({
        where: { id },
        data: { name: dto.name },
      });
    }

    if (dataSource.config && (dto.connectionConfig || dto.fieldMapping || dto.syncSchedule)) {
      await this.prisma.dataSourceConfig.update({
        where: { id: dataSource.config.id },
        data: {
          connectionConfig: dto.connectionConfig
            ? toJsonField(dto.connectionConfig)
            : undefined,
          fieldMapping: dto.fieldMapping
            ? toJsonField(dto.fieldMapping)
            : undefined,
          syncSchedule: dto.syncSchedule,
        },
      });
    }

    return this.findOneOrThrow(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.dataSource.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
