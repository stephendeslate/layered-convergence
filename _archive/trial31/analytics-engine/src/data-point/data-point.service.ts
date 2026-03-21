import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        dataSourceId: dto.dataSourceId,
        timestamp: new Date(dto.timestamp),
        dimensions: (dto.dimensions || {}) as any,
        metrics: (dto.metrics || {}) as any,
      },
    });
  }

  async findAll(dataSourceId?: string) {
    return this.prisma.dataPoint.findMany({
      where: dataSourceId ? { dataSourceId } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    return this.prisma.dataPoint.findUniqueOrThrow({ where: { id } });
  }

  async findByDateRange(dataSourceId: string, startDate: Date, endDate: Date) {
    return this.prisma.dataPoint.findMany({
      where: {
        dataSourceId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async remove(id: string) {
    return this.prisma.dataPoint.delete({ where: { id } });
  }
}
