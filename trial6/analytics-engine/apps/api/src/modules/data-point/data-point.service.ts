import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { QueryDataPointDto } from './dto/query-data-point.dto';
import { fromJsonField } from '../../common/helpers/json-field.helper';

interface DataPointDimensions {
  [key: string]: string | number;
}

interface DataPointMetrics {
  [key: string]: number;
}

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async query(dto: QueryDataPointDto) {
    const where: Record<string, unknown> = {
      dataSourceId: dto.dataSourceId,
    };

    if (dto.startDate || dto.endDate) {
      where.timestamp = {
        ...(dto.startDate ? { gte: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { lte: new Date(dto.endDate) } : {}),
      };
    }

    const dataPoints = await this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: 1000,
    });

    return dataPoints.map((dp) => ({
      id: dp.id,
      timestamp: dp.timestamp,
      dimensions: fromJsonField<DataPointDimensions>(dp.dimensions),
      metrics: fromJsonField<DataPointMetrics>(dp.metrics),
    }));
  }

  async getLatest(dataSourceId: string, limit = 10) {
    return this.prisma.dataPoint.findMany({
      where: { dataSourceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
