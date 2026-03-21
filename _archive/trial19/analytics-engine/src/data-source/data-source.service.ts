import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { config: true, pipeline: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { config: true, pipeline: true },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
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
}
