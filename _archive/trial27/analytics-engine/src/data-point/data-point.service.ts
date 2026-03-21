import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataPointDto, QueryDataPointsDto } from './data-point.dto';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        timestamp: new Date(dto.timestamp),
        dimensions: dto.dimensions as Prisma.InputJsonValue,
        metrics: dto.metrics as Prisma.InputJsonValue,
      },
    });
  }

  async createMany(
    tenantId: string,
    dataSourceId: string,
    points: Array<{
      timestamp: Date;
      dimensions: Record<string, unknown>;
      metrics: Record<string, unknown>;
    }>,
  ) {
    return this.prisma.dataPoint.createMany({
      data: points.map((p) => ({
        tenantId,
        dataSourceId,
        timestamp: p.timestamp,
        dimensions: p.dimensions as Prisma.InputJsonValue,
        metrics: p.metrics as Prisma.InputJsonValue,
      })),
    });
  }

  async query(tenantId: string, dto: QueryDataPointsDto) {
    const where: Record<string, unknown> = {
      tenantId,
      dataSourceId: dto.dataSourceId,
    };

    if (dto.startDate || dto.endDate) {
      const timestamp: Record<string, Date> = {};
      if (dto.startDate) timestamp.gte = new Date(dto.startDate);
      if (dto.endDate) timestamp.lte = new Date(dto.endDate);
      where.timestamp = timestamp;
    }

    return this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });
  }

  async count(tenantId: string, dataSourceId: string) {
    return this.prisma.dataPoint.count({
      where: { tenantId, dataSourceId },
    });
  }
}
