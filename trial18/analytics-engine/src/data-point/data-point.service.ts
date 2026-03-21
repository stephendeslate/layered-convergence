import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataPointDto } from './data-point.dto';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, dataSourceId?: string, metric?: string) {
    return this.prisma.dataPoint.findMany({
      where: {
        tenantId,
        ...(dataSourceId ? { dataSourceId } : {}),
        ...(metric ? { metric } : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async create(tenantId: string, dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        metric: dto.metric,
        value: dto.value,
        dimensions: dto.dimensions ?? {},
        timestamp: new Date(dto.timestamp),
      },
    });
  }

  async createMany(tenantId: string, dtos: CreateDataPointDto[]) {
    const data = dtos.map((dto) => ({
      tenantId,
      dataSourceId: dto.dataSourceId,
      metric: dto.metric,
      value: dto.value,
      dimensions: dto.dimensions ?? {},
      timestamp: new Date(dto.timestamp),
    }));

    return this.prisma.dataPoint.createMany({ data });
  }
}
