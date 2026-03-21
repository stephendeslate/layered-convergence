import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDataPointDto } from './data-point.dto';

@Injectable()
export class DataPointService {
  private readonly logger = new Logger(DataPointService.name);

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

  async createBatch(tenantId: string, dataSourceId: string, points: { timestamp: Date; dimensions: Record<string, unknown>; metrics: Record<string, unknown> }[]) {
    const data = points.map((p) => ({
      tenantId,
      dataSourceId,
      timestamp: p.timestamp,
      dimensions: p.dimensions,
      metrics: p.metrics,
    }));

    const result = await this.prisma.dataPoint.createMany({ data });
    this.logger.log(`Batch created ${result.count} data points for source ${dataSourceId}`);
    return result;
  }

  async query(tenantId: string, dataSourceId: string, startDate: Date, endDate: Date) {
    return this.prisma.dataPoint.findMany({
      where: {
        tenantId,
        dataSourceId,
        timestamp: { gte: startDate, lte: endDate },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async deleteBySource(dataSourceId: string) {
    return this.prisma.dataPoint.deleteMany({ where: { dataSourceId } });
  }
}
