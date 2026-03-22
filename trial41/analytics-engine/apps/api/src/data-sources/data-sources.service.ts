// TRACED:AE-DATASOURCES-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { normalizePageParams } from '@analytics-engine/shared';

@Injectable()
export class DataSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type as 'DATABASE' | 'API' | 'FILE' | 'STREAM',
        connectionUrl: dto.connectionUrl,
        cost: dto.cost ?? 0,
        isActive: dto.isActive ?? true,
        tenantId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        cost: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          cost: true,
          isActive: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst justified: fetching by ID scoped to tenant for authorization
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        connectionUrl: true,
        cost: true,
        isActive: true,
        tenantId: true,
        events: { select: { id: true, name: true, status: true }, take: 10 },
        pipelines: { select: { id: true, name: true, status: true }, take: 10 },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async update(id: string, tenantId: string, dto: UpdateDataSourceDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && {
          type: dto.type as 'DATABASE' | 'API' | 'FILE' | 'STREAM',
        }),
        ...(dto.connectionUrl !== undefined && { connectionUrl: dto.connectionUrl }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        cost: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.dataSource.delete({ where: { id } });
    return { deleted: true };
  }
}
