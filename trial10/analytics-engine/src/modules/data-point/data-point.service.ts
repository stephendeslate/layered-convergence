import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        timestamp: new Date(dto.timestamp),
        dimensions: dto.dimensions ?? {},
        metrics: dto.metrics ?? {},
      },
    });
  }

  async createBatch(tenantId: string, dataPoints: CreateDataPointDto[]) {
    return this.prisma.dataPoint.createMany({
      data: dataPoints.map((dp) => ({
        tenantId,
        dataSourceId: dp.dataSourceId,
        timestamp: new Date(dp.timestamp),
        dimensions: dp.dimensions ?? {},
        metrics: dp.metrics ?? {},
      })),
    });
  }

  async findByDataSource(
    tenantId: string,
    dataSourceId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.prisma.dataPoint.findMany({
      where: {
        tenantId,
        dataSourceId,
        ...(startDate || endDate
          ? {
              timestamp: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { timestamp: 'asc' },
    });
  }
}
