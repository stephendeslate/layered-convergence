// [TRACED:AC-007] DataSource service with tenant-scoped operations

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataSource } from '@prisma/client';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<DataSource[]> {
    return this.prisma.dataSource.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<DataSource | null> {
    return this.prisma.dataSource.findFirst({ where: { id, tenantId } });
  }

  async create(
    data: { name: string; type: string; config?: object; tenantId: string },
  ): Promise<DataSource> {
    return this.prisma.dataSource.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config ?? {},
        tenantId: data.tenantId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: { name?: string; type?: string; config?: object },
  ): Promise<DataSource> {
    return this.prisma.dataSource.update({
      where: { id, tenantId },
      data,
    });
  }

  async remove(id: string, tenantId: string): Promise<DataSource> {
    return this.prisma.dataSource.delete({ where: { id, tenantId } });
  }
}
