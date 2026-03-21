import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-002] DataSource CRUD service with tenant isolation
@Injectable()
export class DataSourceService {
  private readonly logger = new Logger(DataSourceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    return this.prisma.dataSource.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    // findFirst justified: filtering by both id and tenantId for RLS compliance
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });
    if (!dataSource) {
      throw new NotFoundException(`DataSource ${id} not found`);
    }
    return dataSource;
  }

  async create(data: {
    name: string;
    type: 'POSTGRESQL' | 'MYSQL' | 'REST_API' | 'CSV' | 'S3_BUCKET';
    connectionUri: string;
    tenantId: string;
  }) {
    await this.tenantContext.setTenantContext(data.tenantId);
    const dataSource = await this.prisma.dataSource.create({ data });
    this.logger.log(`DataSource created: ${dataSource.id}`);
    return dataSource;
  }

  async update(id: string, tenantId: string, data: { name?: string; isActive?: boolean }) {
    await this.tenantContext.setTenantContext(tenantId);
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
