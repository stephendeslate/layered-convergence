import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDataPointDto } from './dto/create-data-point.dto';
import { QueryDataPointsDto } from './dto/query-data-points.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class DataPointService {
  private readonly logger = new Logger(DataPointService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataPointDto) {
    return this.prisma.dataPoint.create({
      data: {
        dataSourceId: dto.dataSourceId,
        tenantId,
        timestamp: new Date(dto.timestamp),
        dimensions: dto.dimensions ? toJsonValue(dto.dimensions) : undefined,
        metrics: dto.metrics ? toJsonValue(dto.metrics) : undefined,
      },
    });
  }

  async createBatch(tenantId: string, dataSourceId: string, points: { timestamp: string; dimensions?: Record<string, unknown>; metrics?: Record<string, unknown> }[]) {
    this.logger.log(`Ingesting ${points.length} data points for source ${dataSourceId}`);
    return this.prisma.dataPoint.createMany({
      data: points.map((p) => ({
        dataSourceId,
        tenantId,
        timestamp: new Date(p.timestamp),
        dimensions: p.dimensions ? toJsonValue(p.dimensions) : toJsonValue({}),
        metrics: p.metrics ? toJsonValue(p.metrics) : toJsonValue({}),
      })),
    });
  }

  async query(tenantId: string, dto: QueryDataPointsDto) {
    const where: Record<string, unknown> = {
      tenantId,
      dataSourceId: dto.dataSourceId,
    };

    if (dto.startDate || dto.endDate) {
      const timestamp: Record<string, Date> = {};
      if (dto.startDate) timestamp.gte = new Date(dto.startDate);
      if (dto.endDate) timestamp.lte = new Date(dto.endDate);
      where.timestamp = timestamp;
    }

    return this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: 10000,
    });
  }

  async getLatestBySource(dataSourceId: string) {
    // findFirst justified: no data points may exist yet for this source —
    // returning null is the correct behavior when the source has never synced
    return this.prisma.dataPoint.findFirst({
      where: { dataSourceId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async countBySource(dataSourceId: string) {
    return this.prisma.dataPoint.count({ where: { dataSourceId } });
  }
}
