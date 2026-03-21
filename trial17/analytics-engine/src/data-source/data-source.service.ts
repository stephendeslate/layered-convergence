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
        type: dto.type as 'POSTGRESQL' | 'MYSQL' | 'CSV' | 'API',
        config: dto.config,
        syncFrequency: dto.syncFrequency || 'daily',
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: {
        syncRuns: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { dataPoints: true, pipelines: true },
        },
      },
    });

    if (!dataSource) {
      throw new NotFoundException(`DataSource with ID ${id} not found`);
    }

    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    const existing = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`DataSource with ID ${id} not found`);
    }

    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type as 'POSTGRESQL' | 'MYSQL' | 'CSV' | 'API' }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.syncFrequency !== undefined && {
          syncFrequency: dto.syncFrequency,
        }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`DataSource with ID ${id} not found`);
    }

    return this.prisma.dataSource.delete({ where: { id } });
  }
}
