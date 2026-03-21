import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceConfigDto } from './dto/create-data-source-config.dto';
import { UpdateDataSourceConfigDto } from './dto/update-data-source-config.dto';

@Injectable()
export class DataSourceConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceConfigDto) {
    return this.prisma.dataSourceConfig.create({ data: dto as any });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.dataSourceConfig.findUnique({
      where: { dataSourceId },
    });
  }

  async findOne(id: string) {
    return this.prisma.dataSourceConfig.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, dto: UpdateDataSourceConfigDto) {
    return this.prisma.dataSourceConfig.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.dataSourceConfig.delete({ where: { id } });
  }
}
