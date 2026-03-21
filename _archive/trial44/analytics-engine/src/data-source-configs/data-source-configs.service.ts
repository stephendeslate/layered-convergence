import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';

@Injectable()
export class DataSourceConfigsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDataSourceConfigDto) {
    return this.prisma.dataSourceConfig.create({
      data: {
        dataSourceId: dto.dataSourceId,
        connectionConfig: dto.connectionConfig,
        fieldMapping: dto.fieldMapping,
        transformSteps: dto.transformSteps ?? null,
        syncSchedule: dto.syncSchedule,
      },
    });
  }

  async findByDataSource(dataSourceId: string) {
    const config = await this.prisma.dataSourceConfig.findUnique({
      where: { dataSourceId },
    });
    if (!config) {
      throw new NotFoundException(`Config for DataSource ${dataSourceId} not found`);
    }
    return config;
  }

  async update(dataSourceId: string, dto: UpdateDataSourceConfigDto) {
    return this.prisma.dataSourceConfig.update({
      where: { dataSourceId },
      data: {
        ...(dto.connectionConfig !== undefined && { connectionConfig: dto.connectionConfig }),
        ...(dto.fieldMapping !== undefined && { fieldMapping: dto.fieldMapping }),
        ...(dto.transformSteps !== undefined && { transformSteps: dto.transformSteps }),
        ...(dto.syncSchedule !== undefined && { syncSchedule: dto.syncSchedule }),
      },
    });
  }

  async remove(dataSourceId: string) {
    return this.prisma.dataSourceConfig.delete({
      where: { dataSourceId },
    });
  }
}
