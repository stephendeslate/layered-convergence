import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      include: { syncRuns: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: filtering by tenantId + id for tenant isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { syncRuns: { take: 10, orderBy: { createdAt: 'desc' } } },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        config: dto.config,
        syncFrequency: dto.syncFrequency ?? 'daily',
      },
    });
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

    return this.prisma.dataSource.delete({
      where: { id },
    });
  }
}
