import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectorFactory } from '../connectors/connector.factory';
import { AuditService } from '../audit/audit.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { Prisma } from '@prisma/client';

/** Tier limits for data source count */
const TIER_LIMITS: Record<string, number> = {
  FREE: 3,
  PRO: 20,
  ENTERPRISE: Infinity,
};

/** Sync schedule cron mapping for computing nextSyncAt */
const SCHEDULE_INTERVALS_MS: Record<string, number> = {
  EVERY_15_MIN: 15 * 60 * 1000,
  HOURLY: 60 * 60 * 1000,
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
};

@Injectable()
export class DataSourceService {
  private readonly logger = new Logger(DataSourceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connectorFactory: ConnectorFactory,
    private readonly auditService: AuditService,
    @Inject('BULLMQ_QUEUE_DATA_SYNC')
    private readonly syncQueue: Queue,
  ) {}

  async create(tenantId: string, dto: CreateDataSourceDto, tier: string) {
    // Check tier limit
    const currentCount = await this.prisma.dataSource.count({
      where: { tenantId },
    });
    const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.FREE;
    if (currentCount >= limit) {
      throw new ForbiddenException({
        code: 'TIER_LIMIT_EXCEEDED',
        message: `${tier} tier allows ${limit} data source(s). Upgrade to add more.`,
        details: { currentCount, tierLimit: limit, currentTier: tier },
      });
    }

    // Validate that free tier can only use MANUAL schedule
    const syncSchedule = dto.syncSchedule ?? 'MANUAL';
    if (tier === 'FREE' && syncSchedule !== 'MANUAL') {
      throw new ForbiddenException({
        code: 'TIER_LIMIT_EXCEEDED',
        message: 'Free tier only supports MANUAL sync schedule.',
      });
    }

    const nextSyncAt = this.calculateNextSyncAt(syncSchedule);

    // Create data source with config and field mappings atomically
    return this.prisma.$transaction(async (tx) => {
      const dataSource = await tx.dataSource.create({
        data: {
          tenantId,
          name: dto.name,
          connectorType: dto.connectorType as any,
          syncSchedule: syncSchedule as any,
          nextSyncAt,
        },
      });

      // Create config (encrypted placeholder — real encryption in SRS-4)
      if (dto.config) {
        const configJson = JSON.stringify(dto.config);
        const configBytes = Buffer.from(configJson, 'utf-8');
        await tx.dataSourceConfig.create({
          data: {
            dataSourceId: dataSource.id,
            configEncrypted: configBytes,
            configIv: Buffer.alloc(12), // Placeholder IV
            configTag: Buffer.alloc(16), // Placeholder tag
            transforms: (dto.transforms as Prisma.InputJsonValue) ?? [],
          },
        });
      }

      // Create field mappings
      if (dto.fieldMappings && dto.fieldMappings.length > 0) {
        await tx.fieldMapping.createMany({
          data: dto.fieldMappings.map((fm, idx) => ({
            dataSourceId: dataSource.id,
            sourceField: fm.sourceField,
            targetField: fm.targetField,
            fieldType: fm.fieldType as any,
            fieldRole: fm.fieldRole as any,
            isRequired: fm.isRequired ?? false,
            sortOrder: idx,
          })),
        });
      }

      // Fetch the complete data source with relations
      const result = await tx.dataSource.findUniqueOrThrow({
        where: { id: dataSource.id },
        include: {
          fieldMappings: { orderBy: { sortOrder: 'asc' } },
        },
      });

      await this.auditService.log({
        tenantId,
        action: 'DATASOURCE_CREATED' as any,
        resourceType: 'DataSource',
        resourceId: dataSource.id,
      });

      return result;
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDataSourceDto) {
    const existing = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Data source not found');

    return this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};
      if (dto.name) updateData.name = dto.name;
      if (dto.syncSchedule) {
        updateData.syncSchedule = dto.syncSchedule;
        updateData.nextSyncAt = this.calculateNextSyncAt(dto.syncSchedule);
      }

      const dataSource = await tx.dataSource.update({
        where: { id },
        data: updateData as any,
      });

      if (dto.config) {
        const configJson = JSON.stringify(dto.config);
        const configBytes = Buffer.from(configJson, 'utf-8');
        await tx.dataSourceConfig.upsert({
          where: { dataSourceId: id },
          update: {
            configEncrypted: configBytes,
            configIv: Buffer.alloc(12),
            configTag: Buffer.alloc(16),
          },
          create: {
            dataSourceId: id,
            configEncrypted: configBytes,
            configIv: Buffer.alloc(12),
            configTag: Buffer.alloc(16),
          },
        });
      }

      if (dto.transforms) {
        await tx.dataSourceConfig.update({
          where: { dataSourceId: id },
          data: { transforms: dto.transforms as Prisma.InputJsonValue },
        });
      }

      if (dto.fieldMappings) {
        await tx.fieldMapping.deleteMany({ where: { dataSourceId: id } });
        if (dto.fieldMappings.length > 0) {
          await tx.fieldMapping.createMany({
            data: dto.fieldMappings.map((fm, idx) => ({
              dataSourceId: id,
              sourceField: fm.sourceField,
              targetField: fm.targetField,
              fieldType: fm.fieldType as any,
              fieldRole: fm.fieldRole as any,
              isRequired: fm.isRequired ?? false,
              sortOrder: idx,
            })),
          });
        }
      }

      await this.auditService.log({
        tenantId,
        action: 'DATASOURCE_UPDATED' as any,
        resourceType: 'DataSource',
        resourceId: id,
      });

      return tx.dataSource.findUniqueOrThrow({
        where: { id: dataSource.id },
        include: {
          fieldMappings: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });
  }

  async delete(id: string, tenantId: string) {
    const existing = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Data source not found');

    // Cancel any active sync jobs by removing repeatable jobs
    try {
      const repeatableJobs = await this.syncQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        if (job.name === `sync-${id}`) {
          await this.syncQueue.removeRepeatableByKey(job.key);
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to remove scheduled sync jobs: ${err}`);
    }

    await this.prisma.dataSource.delete({ where: { id } });

    await this.auditService.log({
      tenantId,
      action: 'DATASOURCE_DELETED' as any,
      resourceType: 'DataSource',
      resourceId: id,
    });
  }

  async list(
    tenantId: string,
    query: { cursor?: string; limit?: number } = {},
  ) {
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { tenantId };

    const dataSources = await this.prisma.dataSource.findMany({
      where: where as any,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        fieldMappings: { orderBy: { sortOrder: 'asc' } },
        syncRuns: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, status: true, createdAt: true },
        },
      },
    });

    const hasMore = dataSources.length > limit;
    const items = hasMore ? dataSources.slice(0, limit) : dataSources;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      data: items,
      meta: {
        pagination: {
          cursor: nextCursor,
          hasMore,
          limit,
        },
      },
    };
  }

  async get(id: string, tenantId: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: {
        fieldMappings: { orderBy: { sortOrder: 'asc' } },
        syncRuns: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!dataSource) throw new NotFoundException('Data source not found');
    return dataSource;
  }

  async testConnection(id: string, tenantId: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { config: true },
    });

    if (!dataSource) throw new NotFoundException('Data source not found');

    const connector = this.connectorFactory.getConnector(
      dataSource.connectorType,
    );

    // Decrypt config (placeholder — just parse the stored bytes)
    const config = dataSource.config
      ? JSON.parse(
          Buffer.from(dataSource.config.configEncrypted).toString('utf-8'),
        )
      : {};

    const result = await connector.testConnection(config);

    await this.auditService.log({
      tenantId,
      action: 'DATASOURCE_TEST_CONNECTION' as any,
      resourceType: 'DataSource',
      resourceId: id,
      metadata: { valid: result.valid, error: result.error },
    });

    return result;
  }

  async triggerSync(id: string, tenantId: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });
    if (!dataSource) throw new NotFoundException('Data source not found');

    if (dataSource.syncPaused) {
      throw new ConflictException(
        'Sync is paused for this data source. Resume sync before triggering.',
      );
    }

    // Check no active sync
    const activeRun = await this.prisma.syncRun.findFirst({
      where: { dataSourceId: id, status: 'RUNNING' },
    });
    if (activeRun) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'A sync is already running for this data source.',
        details: { activeSyncRunId: activeRun.id },
      });
    }

    // Create sync run
    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId: id,
        tenantId,
        status: 'IDLE',
      },
    });

    // Enqueue sync job
    await this.syncQueue.add(
      'sync',
      {
        dataSourceId: id,
        tenantId,
        syncRunId: syncRun.id,
        triggeredBy: 'manual',
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    await this.auditService.log({
      tenantId,
      action: 'SYNC_STARTED' as any,
      resourceType: 'SyncRun',
      resourceId: syncRun.id,
    });

    return {
      syncRunId: syncRun.id,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      message:
        'Sync started. Monitor progress via SSE or GET /api/sync-runs/' +
        syncRun.id,
    };
  }

  async resumeSync(id: string, tenantId: string) {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });
    if (!dataSource) throw new NotFoundException('Data source not found');

    if (!dataSource.syncPaused) {
      throw new ConflictException('Sync is not paused for this data source.');
    }

    await this.prisma.dataSource.update({
      where: { id },
      data: { syncPaused: false, consecutiveFails: 0 },
    });

    await this.auditService.log({
      tenantId,
      action: 'SYNC_RESUMED' as any,
      resourceType: 'DataSource',
      resourceId: id,
    });

    return { message: 'Sync resumed successfully' };
  }

  /** Decrypt the config for a data source (placeholder implementation) */
  async getDecryptedConfig(
    dataSourceId: string,
  ): Promise<Record<string, unknown>> {
    const config = await this.prisma.dataSourceConfig.findUnique({
      where: { dataSourceId },
    });
    if (!config) return {};
    return JSON.parse(
      Buffer.from(config.configEncrypted).toString('utf-8'),
    );
  }

  private calculateNextSyncAt(schedule: string): Date | null {
    const interval = SCHEDULE_INTERVALS_MS[schedule];
    if (!interval) return null; // MANUAL
    return new Date(Date.now() + interval);
  }
}
