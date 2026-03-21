import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDataPointDto, QueryDataPointsDto } from './data-point.dto';

@Injectable()
export class DataPointService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataPointDto) {
    // Verify data source belongs to tenant
    await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dto.dataSourceId, tenantId },
    });

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

  async createBatch(tenantId: string, dataSourceId: string, points: CreateDataPointDto[]) {
    await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, tenantId },
    });

    return this.prisma.dataPoint.createMany({
      data: points.map((p) => ({
        tenantId,
        dataSourceId,
        timestamp: new Date(p.timestamp),
        dimensions: p.dimensions ?? {},
        metrics: p.metrics ?? {},
      })),
    });
  }

  async query(tenantId: string, dto: QueryDataPointsDto) {
    const where: Record<string, unknown> = { tenantId };

    if (dto.dataSourceId) {
      where.dataSourceId = dto.dataSourceId;
    }
    if (dto.startDate || dto.endDate) {
      where.timestamp = {};
      if (dto.startDate) (where.timestamp as Record<string, unknown>).gte = new Date(dto.startDate);
      if (dto.endDate) (where.timestamp as Record<string, unknown>).lte = new Date(dto.endDate);
    }

    return this.prisma.dataPoint.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: dto.limit ?? 1000,
    });
  }

  async count(tenantId: string, dataSourceId?: string) {
    return this.prisma.dataPoint.count({
      where: {
        tenantId,
        ...(dataSourceId ? { dataSourceId } : {}),
      },
    });
  }
}
