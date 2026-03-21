// [TRACED:AE-AC-004] DataSource CRUD with tenant isolation
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; type: string; config?: Record<string, unknown>; tenantId: string }) {
    return this.prisma.dataSource.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config ?? {},
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataSource.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId for tenant isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException('DataSource not found');
    }

    return dataSource;
  }

  async update(id: string, tenantId: string, data: { name?: string; config?: Record<string, unknown> }) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
