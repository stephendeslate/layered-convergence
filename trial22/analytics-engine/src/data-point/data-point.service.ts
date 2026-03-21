// [TRACED:AC-009] DataPoint service with Decimal precision handling

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataPoint } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<DataPoint[]> {
    return this.prisma.dataPoint.findMany({ where: { tenantId } });
  }

  async findByDataSource(
    dataSourceId: string,
    tenantId: string,
  ): Promise<DataPoint[]> {
    return this.prisma.dataPoint.findMany({
      where: { dataSourceId, tenantId },
    });
  }

  async create(
    data: {
      key: string;
      value: string;
      dataSourceId: string;
      tenantId: string;
      timestamp?: Date;
    },
  ): Promise<DataPoint> {
    return this.prisma.dataPoint.create({
      data: {
        key: data.key,
        value: new Decimal(data.value),
        dataSourceId: data.dataSourceId,
        tenantId: data.tenantId,
        timestamp: data.timestamp,
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<DataPoint> {
    return this.prisma.dataPoint.delete({ where: { id, tenantId } });
  }
}
