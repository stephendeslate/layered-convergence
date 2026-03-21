import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

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
      include: { config: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { config: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });

    if (!dataSource || dataSource.tenantId !== tenantId) {
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
