import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { QueryDataPointsDto } from './dto/query-data-points.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        dataSourceId: dto.dataSourceId,
        timestamp: new Date(dto.timestamp),
        dimensions: dto.dimensions ? toJsonField(dto.dimensions) : undefined,
        metrics: dto.metrics ? toJsonField(dto.metrics) : undefined,
      },
    });
  }

  async createMany(dataPoints: CreateDataPointDto[]) {
    return this.prisma.dataPoint.createMany({
      data: dataPoints.map((dp) => ({
        dataSourceId: dp.dataSourceId,
        timestamp: new Date(dp.timestamp),
        dimensions: dp.dimensions ? toJsonField(dp.dimensions) : undefined,
        metrics: dp.metrics ? toJsonField(dp.metrics) : undefined,
      })),
    });
  }

  async query(dto: QueryDataPointsDto) {
    const where: Record<string, unknown> = {
      dataSourceId: dto.dataSourceId,
    };

    if (dto.startDate || dto.endDate) {
      where['timestamp'] = {
        ...(dto.startDate ? { gte: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { lte: new Date(dto.endDate) } : {}),
      };
    }

    return this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: 10000,
    });
  }

  async count(dataSourceId: string) {
    return this.prisma.dataPoint.count({
      where: { dataSourceId },
    });
  }
}
