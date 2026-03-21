import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { QueryDataPointsDto } from './dto/query-data-points.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        metric: dto.metric,
        value: dto.value,
        timestamp: new Date(dto.timestamp),
        dimensions: dto.dimensions ?? {},
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
    });
  }

  async createBatch(tenantId: string, dtos: CreateDataPointDto[]) {
    const data = dtos.map((dto) => ({
      metric: dto.metric,
      value: dto.value,
      timestamp: new Date(dto.timestamp),
      dimensions: (dto.dimensions ?? {}) as Prisma.InputJsonValue,
      dataSourceId: dto.dataSourceId,
      tenantId,
    }));

    return this.prisma.dataPoint.createMany({ data });
  }

  async query(tenantId: string, query: QueryDataPointsDto) {
    const where: Prisma.DataPointWhereInput = {
      tenantId,
      ...(query.metric ? { metric: query.metric } : {}),
      ...(query.dataSourceId ? { dataSourceId: query.dataSourceId } : {}),
      ...(query.startDate || query.endDate
        ? {
            timestamp: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    if (query.aggregation) {
      return this.aggregate(where, query.aggregation);
    }

    return this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });
  }

  private async aggregate(
    where: Prisma.DataPointWhereInput,
    aggregation: string,
  ) {
    const result = await this.prisma.dataPoint.aggregate({
      where,
      _avg: aggregation === 'avg' ? { value: true } : undefined,
      _sum: aggregation === 'sum' ? { value: true } : undefined,
      _min: aggregation === 'min' ? { value: true } : undefined,
      _max: aggregation === 'max' ? { value: true } : undefined,
      _count: aggregation === 'count' ? { value: true } : undefined,
    });

    return {
      aggregation,
      result:
        aggregation === 'avg'
          ? result._avg?.value
          : aggregation === 'sum'
            ? result._sum?.value
            : aggregation === 'min'
              ? result._min?.value
              : aggregation === 'max'
                ? result._max?.value
                : aggregation === 'count'
                  ? result._count?.value
                  : null,
    };
  }

  async getMetrics(tenantId: string) {
    const results = await this.prisma.dataPoint.findMany({
      where: { tenantId },
      select: { metric: true },
      distinct: ['metric'],
    });
    return results.map((r) => r.metric);
  }
}
