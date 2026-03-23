import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-sources.dto';
import { clampPageSize, calculateSkip } from '@analytics-engine/shared';

// TRACED:AE-API-005
@Injectable()
export class DataSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as 'POSTGRESQL' | 'MYSQL' | 'REST_API' | 'CSV' | 'S3',
        connectionUri: dto.connectionUri,
        config: dto.config ?? {},
        monthlyCost: dto.monthlyCost,
        tenantId: dto.tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const size = clampPageSize(pageSize);
    const skip = calculateSkip(page, size);

    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        skip,
        take: size,
        include: { pipelines: { select: { id: true, name: true, status: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return { data, total, page: page ?? 1, pageSize: size };
  }

  async findOne(id: string) {
    // findFirst: include pipelines relation for detail view
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id },
      include: { pipelines: { select: { id: true, name: true, status: true } } },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async update(id: string, dto: UpdateDataSourceDto) {
    await this.findOne(id);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
