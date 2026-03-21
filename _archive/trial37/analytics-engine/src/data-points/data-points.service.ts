import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';

@Injectable()
export class DataPointsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        dataSourceId: dto.dataSourceId,
        timestamp: new Date(dto.timestamp),
        dimensions: dto.dimensions,
        metrics: dto.metrics,
      },
    });
  }

  async createMany(dataPoints: CreateDataPointDto[]) {
    return this.prisma.dataPoint.createMany({
      data: dataPoints.map((dp) => ({
        dataSourceId: dp.dataSourceId,
        timestamp: new Date(dp.timestamp),
        dimensions: dp.dimensions,
        metrics: dp.metrics,
      })),
    });
  }

  async findByDataSource(dataSourceId: string, from?: Date, to?: Date) {
    return this.prisma.dataPoint.findMany({
      where: {
        dataSourceId,
        ...(from || to
          ? {
              timestamp: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
              },
            }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async countByDataSource(dataSourceId: string) {
    return this.prisma.dataPoint.count({
      where: { dataSourceId },
    });
  }
}
