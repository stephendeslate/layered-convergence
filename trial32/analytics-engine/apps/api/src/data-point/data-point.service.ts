// [TRACED:AE-AC-005] DataPoint CRUD with tenant isolation
// [TRACED:AE-DM-004] DataPoint value with Decimal precision
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { value: number; label: string; dataSourceId: string; tenantId: string }) {
    return this.prisma.dataPoint.create({
      data: {
        value: new Decimal(data.value),
        label: data.label,
        dataSourceId: data.dataSourceId,
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataPoint.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId for tenant isolation
    const dataPoint = await this.prisma.dataPoint.findFirst({
      where: { id, tenantId },
    });

    if (!dataPoint) {
      throw new NotFoundException('DataPoint not found');
    }

    return dataPoint;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataPoint.delete({ where: { id } });
  }
}
