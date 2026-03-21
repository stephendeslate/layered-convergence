import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDataPointDto,
  CreateDataPointBatchDto,
  QueryDataPointsDto,
} from './data-point.dto';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataPointDto) {
    // Verify data source belongs to tenant — findFirst ensures tenant isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dto.dataSourceId, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return this.prisma.dataPoint.create({
      data: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        metric: dto.metric,
        value: dto.value,
        dimensions: dto.dimensions || {},
        timestamp: new Date(dto.timestamp),
      },
    });
  }

  async createBatch(tenantId: string, dto: CreateDataPointBatchDto) {
    // Verify all referenced data sources belong to tenant
    const dataSourceIds = [
      ...new Set(dto.dataPoints.map((dp) => dp.dataSourceId)),
    ];

    for (const dsId of dataSourceIds) {
      // findFirst with tenantId filter ensures each data source belongs to tenant
      const dataSource = await this.prisma.dataSource.findFirst({
        where: { id: dsId, tenantId },
      });
      if (!dataSource) {
        throw new NotFoundException(
          `Data source ${dsId} not found for this tenant`,
        );
      }
    }

    return this.prisma.dataPoint.createMany({
      data: dto.dataPoints.map((dp) => ({
        tenantId,
        dataSourceId: dp.dataSourceId,
        metric: dp.metric,
        value: dp.value,
        dimensions: dp.dimensions || {},
        timestamp: new Date(dp.timestamp),
      })),
    });
  }

  async query(tenantId: string, query: QueryDataPointsDto) {
    const where: Record<string, unknown> = { tenantId };

    if (query.dataSourceId) {
      where.dataSourceId = query.dataSourceId;
    }

    if (query.metric) {
      where.metric = query.metric;
    }

    if (query.startDate || query.endDate) {
      const timestamp: Record<string, Date> = {};
      if (query.startDate) {
        timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        timestamp.lte = new Date(query.endDate);
      }
      where.timestamp = timestamp;
    }

    const [data, total] = await Promise.all([
      this.prisma.dataPoint.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: query.limit || 100,
        skip: query.offset || 0,
      }),
      this.prisma.dataPoint.count({ where }),
    ]);

    return { data, total, limit: query.limit || 100, offset: query.offset || 0 };
  }

  async getMetrics(tenantId: string) {
    const metrics = await this.prisma.dataPoint.findMany({
      where: { tenantId },
      select: { metric: true },
      distinct: ['metric'],
    });

    return metrics.map((m) => m.metric);
  }

  async getAggregation(
    tenantId: string,
    metric: string,
    startDate: string,
    endDate: string,
  ) {
    const result = await this.prisma.dataPoint.aggregate({
      where: {
        tenantId,
        metric,
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _avg: { value: true },
      _sum: { value: true },
      _min: { value: true },
      _max: { value: true },
      _count: true,
    });

    return {
      metric,
      startDate,
      endDate,
      avg: result._avg.value,
      sum: result._sum.value,
      min: result._min.value,
      max: result._max.value,
      count: result._count,
    };
  }
}
