import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateDataSourceDto,
  CreateDataSourceConfigDto,
} from './dto/create-datasource.dto.js';
import {
  UpdateDataSourceDto,
  UpdateDataSourceConfigDto,
} from './dto/update-datasource.dto.js';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { config: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scoped by tenantId + id — ensures tenant isolation
    const ds = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { config: true },
    });
    if (!ds) {
      throw new NotFoundException('DataSource not found');
    }
    return ds;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  async createConfig(
    tenantId: string,
    dataSourceId: string,
    dto: CreateDataSourceConfigDto,
  ) {
    await this.findOne(tenantId, dataSourceId);
    return this.prisma.dataSourceConfig.create({
      data: { ...dto, dataSourceId },
    });
  }

  async updateConfig(
    tenantId: string,
    dataSourceId: string,
    dto: UpdateDataSourceConfigDto,
  ) {
    await this.findOne(tenantId, dataSourceId);
    // findFirst: dataSourceId is unique — at most one config per data source
    const config = await this.prisma.dataSourceConfig.findFirst({
      where: { dataSourceId },
    });
    if (!config) {
      throw new NotFoundException('DataSourceConfig not found');
    }
    return this.prisma.dataSourceConfig.update({
      where: { id: config.id },
      data: dto,
    });
  }
}
