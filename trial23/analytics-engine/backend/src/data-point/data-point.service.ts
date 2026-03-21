// [TRACED:AC-005] DataPoint CRUD with tenant isolation
// [TRACED:DM-004] DataPoint value stored as Decimal(20,6)

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { value: string; label: string; dataSourceId: string; tenantId: string; timestamp?: Date }) {
    return this.prisma.dataPoint.create({
      data: {
        value: new Decimal(data.value),
        label: data.label,
        dataSourceId: data.dataSourceId,
        tenantId: data.tenantId,
        timestamp: data.timestamp ?? new Date(),
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.dataPoint.findMany({
      where: { tenantId },
    });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId (no unique constraint on this composite)
    const dataPoint = await this.prisma.dataPoint.findFirst({
      where: { id, tenantId },
    });

    if (!dataPoint) {
      throw new NotFoundException('DataPoint not found');
    }

    return dataPoint;
  }

  async update(id: string, tenantId: string, data: { value?: string; label?: string }) {
    await this.findOne(id, tenantId);

    const updateData: { value?: Decimal; label?: string } = {};
    if (data.value !== undefined) {
      updateData.value = new Decimal(data.value);
    }
    if (data.label !== undefined) {
      updateData.label = data.label;
    }

    return this.prisma.dataPoint.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dataPoint.delete({
      where: { id },
    });
  }
}
