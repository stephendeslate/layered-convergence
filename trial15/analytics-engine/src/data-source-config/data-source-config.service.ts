import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';

@Injectable()
export class DataSourceConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceConfigDto) {
    return this.prisma.dataSourceConfig.create({
      data: {
        key: dto.key,
        value: dto.value,
        encrypted: dto.encrypted ?? false,
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, dataSourceId?: string) {
    return this.prisma.dataSourceConfig.findMany({
      where: {
        tenantId,
        ...(dataSourceId ? { dataSourceId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: justified because we filter by both id and tenantId for tenant isolation
    const config = await this.prisma.dataSourceConfig.findFirst({
      where: { id, tenantId },
    });

    if (!config) {
      throw new NotFoundException(`DataSourceConfig with id ${id} not found`);
    }

    return config;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceConfigDto) {
    await this.findOne(tenantId, id);

    return this.prisma.dataSourceConfig.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.dataSourceConfig.delete({
      where: { id },
    });
  }
}
