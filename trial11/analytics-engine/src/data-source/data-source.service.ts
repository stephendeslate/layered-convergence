import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDataSourceDto } from './dto/create-data-source.dto.js';
import { UpdateDataSourceDto } from './dto/update-data-source.dto.js';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        tenantId,
        ...(dto.config
          ? {
              dataSourceConfig: {
                create: {
                  // type assertion justified: DTO Record<string, unknown> → Prisma InputJsonValue
                  connectionConfig: dto.config.connectionConfig as Prisma.InputJsonValue,
                  fieldMapping: dto.config.fieldMapping as Prisma.InputJsonValue,
                  transformSteps: (dto.config.transformSteps ?? {}) as Prisma.InputJsonValue,
                  syncSchedule: dto.config.syncSchedule,
                },
              },
            }
          : {}),
      },
      include: { dataSourceConfig: true },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { dataSourceConfig: true },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.dataSource.findUniqueOrThrow({
      where: { id, tenantId },
      include: { dataSourceConfig: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    const { name, type, ...configFields } = dto;
    const dataSourceUpdate: Record<string, unknown> = {};
    if (name !== undefined) dataSourceUpdate.name = name;
    if (type !== undefined) dataSourceUpdate.type = type;

    const hasConfigUpdate = Object.keys(configFields).length > 0;

    // type assertion justified: DTO Record<string, unknown> → Prisma InputJsonValue for Json fields
    const castConfigFields = {
      ...(configFields.connectionConfig !== undefined
        ? { connectionConfig: configFields.connectionConfig as Prisma.InputJsonValue }
        : {}),
      ...(configFields.fieldMapping !== undefined
        ? { fieldMapping: configFields.fieldMapping as Prisma.InputJsonValue }
        : {}),
      ...(configFields.transformSteps !== undefined
        ? { transformSteps: configFields.transformSteps as Prisma.InputJsonValue }
        : {}),
      ...(configFields.syncSchedule !== undefined
        ? { syncSchedule: configFields.syncSchedule }
        : {}),
    };

    return this.prisma.dataSource.update({
      where: { id, tenantId },
      data: {
        ...dataSourceUpdate,
        ...(hasConfigUpdate
          ? {
              dataSourceConfig: {
                upsert: {
                  create: {
                    connectionConfig: (configFields.connectionConfig ?? {}) as Prisma.InputJsonValue,
                    fieldMapping: (configFields.fieldMapping ?? {}) as Prisma.InputJsonValue,
                    transformSteps: (configFields.transformSteps ?? {}) as Prisma.InputJsonValue,
                    syncSchedule: configFields.syncSchedule,
                  },
                  update: castConfigFields,
                },
              },
            }
          : {}),
      },
      include: { dataSourceConfig: true },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.dataSource.delete({
      where: { id, tenantId },
    });
  }
}
