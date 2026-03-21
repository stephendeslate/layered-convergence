import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    // findUnique for primary key lookup
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id },
    });
    if (!dataSource || dataSource.tenantId !== tenantId) {
      throw new NotFoundException('Data source not found');
    }
    return dataSource;
  }

  async create(dto: CreateDataSourceDto, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        config: dto.config ?? {},
        tenantId,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    const dataSource = await this.findById(id, tenantId);
    return this.prisma.dataSource.delete({
      where: { id: dataSource.id },
    });
  }
}
