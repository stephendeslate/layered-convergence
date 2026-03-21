import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDataPointDto } from './dto/create-datapoint.dto.js';
import { QueryDataPointDto } from './dto/query-datapoint.dto.js';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        timestamp: new Date(dto.timestamp),
        dimensions: dto.dimensions,
        metrics: dto.metrics,
      },
    });
  }

  async createMany(
    tenantId: string,
    dataSourceId: string,
    points: Array<{
      timestamp: Date;
      dimensions: Record<string, any>;
      metrics: Record<string, any>;
    }>,
  ) {
    const data = points.map((p) => ({
      tenantId,
      dataSourceId,
      timestamp: p.timestamp,
      dimensions: p.dimensions,
      metrics: p.metrics,
    }));
    return this.prisma.dataPoint.createMany({ data });
  }

  async query(tenantId: string, query: QueryDataPointDto) {
    const where: any = { tenantId };

    if (query.dataSourceId) {
      where.dataSourceId = query.dataSourceId;
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    if (query.aggregation && dataPoints.length > 0) {
      return this.aggregate(dataPoints, query.aggregation, query.groupBy);
    }

    return dataPoints;
  }

  private aggregate(
    dataPoints: any[],
    aggregation: string,
    groupBy?: string,
  ) {
    if (groupBy) {
      const groups = new Map<string, any[]>();
      for (const dp of dataPoints) {
        const key = String(
          (dp.dimensions as Record<string, any>)[groupBy] ?? 'unknown',
        );
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(dp);
      }

      const result: Record<string, any> = {};
      for (const [key, points] of groups) {
        result[key] = this.computeAggregation(points, aggregation);
      }
      return result;
    }

    return this.computeAggregation(dataPoints, aggregation);
  }

  private computeAggregation(dataPoints: any[], aggregation: string) {
    const metrics = dataPoints.map((dp) => dp.metrics as Record<string, any>);
    const allKeys = new Set<string>();
    for (const m of metrics) {
      for (const k of Object.keys(m)) {
        allKeys.add(k);
      }
    }

    const result: Record<string, number> = {};
    for (const key of allKeys) {
      const values = metrics
        .map((m) => m[key])
        .filter((v) => typeof v === 'number');

      switch (aggregation) {
        case 'sum':
          result[key] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[key] =
            values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0;
          break;
        case 'count':
          result[key] = values.length;
          break;
        case 'min':
          result[key] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          result[key] = values.length > 0 ? Math.max(...values) : 0;
          break;
      }
    }

    return result;
  }
}
