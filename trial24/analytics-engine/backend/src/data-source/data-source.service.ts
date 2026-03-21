// [TRACED:AC-004] DataSource CRUD with tenant isolation

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; type: string; tenantId: string; config?: Record<string, unknown> }) {
    return this.prisma.dataSource.create({
      data: {
        name: data.name,
        type: data.type,
        tenantId: data.tenantId,
        config: data.config ?? {},
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({
      where: { tenantId },
    });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId composite — no unique constraint on this pair
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException('DataSource not found');
    }

    return dataSource;
  }

  async update(id: string, tenantId: string, data: { name?: string; type?: string; config?: Record<string, unknown> }) {
    await this.findOne(id, tenantId);

    return this.prisma.dataSource.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dataSource.delete({
      where: { id },
    });
  }
}
