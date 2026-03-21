import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDataSourceConfigDto,
  UpdateDataSourceConfigDto,
} from './data-source-config.dto';

@Injectable()
export class DataSourceConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceConfigDto) {
    return this.prisma.dataSourceConfig.create({
      data: {
        dataSourceId: dto.dataSourceId,
        connectionConfig: dto.connectionConfig as Prisma.InputJsonValue,
        fieldMapping: dto.fieldMapping as Prisma.InputJsonValue,
        transformSteps: (dto.transformSteps ?? []) as Prisma.InputJsonValue,
        syncSchedule: dto.syncSchedule,
      },
    });
  }

  async findByDataSourceId(dataSourceId: string) {
    const config = await this.prisma.dataSourceConfig.findFirst({
      where: { dataSourceId },
    });

    if (!config) {
      throw new NotFoundException('Data source config not found');
    }

    return config;
  }

  async update(id: string, dto: UpdateDataSourceConfigDto) {
    const existing = await this.prisma.dataSourceConfig.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Data source config not found');
    }

    return this.prisma.dataSourceConfig.update({
      where: { id },
      data: {
        ...(dto.connectionConfig && {
          connectionConfig: dto.connectionConfig as Prisma.InputJsonValue,
        }),
        ...(dto.fieldMapping && {
          fieldMapping: dto.fieldMapping as Prisma.InputJsonValue,
        }),
        ...(dto.transformSteps && {
          transformSteps: dto.transformSteps as Prisma.InputJsonValue,
        }),
        ...(dto.syncSchedule !== undefined && {
          syncSchedule: dto.syncSchedule,
        }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.dataSourceConfig.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Data source config not found');
    }

    return this.prisma.dataSourceConfig.delete({ where: { id } });
  }
}
