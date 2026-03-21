import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { encrypt, generateWebhookSecret } from '../common/encryption';
import { ConnectorType } from '@analytics-engine/shared';

@Injectable()
export class DataSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    const connectionConfig = this.encryptSensitiveFields(
      dto.type,
      dto.config.connectionConfig,
    );

    const webhookSecret = dto.type === ConnectorType.WEBHOOK
      ? generateWebhookSecret()
      : undefined;

    const dataSource = await this.prisma.dataSource.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        config: {
          create: {
            connectionConfig: connectionConfig as Prisma.InputJsonValue,
            fieldMapping: (dto.config.fieldMapping ?? []) as Prisma.InputJsonValue,
            transformSteps: (dto.config.transformSteps ?? []) as Prisma.InputJsonValue,
            syncSchedule: dto.config.syncSchedule,
            webhookSecret,
          },
        },
      },
      include: { config: true },
    });

    return dataSource;
  }

  async findAll(tenantId: string, cursor?: string, limit: number = 20, type?: string) {
    const take = Math.min(limit, 100);
    const where: Record<string, unknown> = { tenantId };
    if (type) {
      where.type = type;
    }

    const dataSources = await this.prisma.dataSource.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        syncRuns: {
          take: 1,
          orderBy: { startedAt: 'desc' },
          select: { status: true, startedAt: true },
        },
      },
    });

    const hasMore = dataSources.length > take;
    const data = hasMore ? dataSources.slice(0, take) : dataSources;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data: data.map((ds) => ({
        id: ds.id,
        name: ds.name,
        type: ds.type,
        isActive: ds.isActive,
        lastSyncStatus: ds.syncRuns[0]?.status ?? null,
        lastSyncAt: ds.syncRuns[0]?.startedAt ?? null,
        createdAt: ds.createdAt,
      })),
      nextCursor,
      hasMore,
    };
  }

  async findOne(tenantId: string, id: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { config: true },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    const existing = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Data source not found');
    }

    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Data source not found');
    }

    await this.prisma.dataSource.delete({ where: { id } });
  }

  private encryptSensitiveFields(
    type: ConnectorType,
    config: Record<string, unknown>,
  ): Record<string, unknown> {
    const result = { ...config };

    if (type === ConnectorType.POSTGRESQL && typeof result.connectionString === 'string') {
      result.connectionString = encrypt(result.connectionString);
    }

    if (type === ConnectorType.REST_API && result.headers && typeof result.headers === 'object') {
      const headers = result.headers as Record<string, string>;
      if (headers.Authorization) {
        headers.Authorization = encrypt(headers.Authorization);
      }
      result.headers = headers;
    }

    return result;
  }
}
