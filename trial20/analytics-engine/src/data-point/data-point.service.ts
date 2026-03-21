import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DataPointService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findByDataSource(dataSourceId: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.dataPoint.findMany({
      where: { dataSourceId, tenantId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async create(dto: CreateDataPointDto, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.dataPoint.create({
      data: {
        value: new Decimal(dto.value),
        label: dto.label,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
    });
  }

  async deleteByDataSource(dataSourceId: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.dataPoint.deleteMany({
      where: { dataSourceId, tenantId },
    });
  }
}
