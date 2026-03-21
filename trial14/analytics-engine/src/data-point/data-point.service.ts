import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  async createMany(tenantId: string, dataSourceId: string, points: { timestamp: Date; dimensions: any; metrics: any }[]) {
    return this.prisma.dataPoint.createMany({
      data: points.map((p) => ({
        tenantId,
        dataSourceId,
        timestamp: p.timestamp,
        dimensions: p.dimensions,
        metrics: p.metrics,
      })),
    });
  }

  async query(tenantId: string, dataSourceId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId, dataSourceId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    return this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });
  }

  async deleteByDataSource(dataSourceId: string) {
    return this.prisma.dataPoint.deleteMany({ where: { dataSourceId } });
  }
}
