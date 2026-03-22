// TRACED:AE-API-05 — DataSources CRUD service with Prisma select/include
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams, paginate, PaginatedResult } from '@analytics-engine/shared';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto): Promise<Record<string, unknown>> {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as 'DATABASE' | 'API' | 'FILE' | 'STREAM',
        config: dto.config || {},
        cost: dto.cost ?? 0,
        tenantId: dto.tenantId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        cost: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const params = normalizePageParams(page, pageSize);
    const { skip, take } = paginate(params);

    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          type: true,
          cost: true,
          createdAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return {
      data,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    // findFirst justified: lookup by primary key for detail endpoint
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id },
      include: {
        tenant: { select: { id: true, name: true } },
        pipelines: { select: { id: true, name: true, status: true } },
      },
    });

    if (!dataSource) {
      throw new NotFoundException(`DataSource ${id} not found`);
    }

    return dataSource;
  }

  async update(id: string, dto: UpdateDataSourceDto): Promise<Record<string, unknown>> {
    await this.findOne(id);

    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type as 'DATABASE' | 'API' | 'FILE' | 'STREAM' }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
      },
      select: {
        id: true,
        name: true,
        type: true,
        cost: true,
        tenantId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.prisma.dataSource.delete({ where: { id } });
    return { deleted: true };
  }
}
