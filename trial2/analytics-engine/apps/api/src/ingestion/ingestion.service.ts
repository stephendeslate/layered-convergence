import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectorFactory } from '../connectors/connector.factory';
import { SchemaMapperService } from './schema-mapper.service';
import { TransformService } from './transform.service';
import {
  ConnectorType,
  SyncStatus,
  FieldMapping,
  TransformStep,
  assertTransition,
} from '@analytics-engine/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connectorFactory: ConnectorFactory,
    private readonly schemaMapper: SchemaMapperService,
    private readonly transformService: TransformService,
  ) {}

  async runSync(dataSourceId: string): Promise<{ syncRunId: string; rowsIngested: number }> {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      include: { config: true },
    });

    if (!dataSource || !dataSource.config) {
      throw new Error(`DataSource not found or missing config: ${dataSourceId}`);
    }

    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId: dataSource.id,
        status: SyncStatus.PENDING,
      },
    });

    try {
      assertTransition(SyncStatus.PENDING as SyncStatus, SyncStatus.RUNNING);
      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: SyncStatus.RUNNING },
      });

      const connectorType = dataSource.type as ConnectorType;
      const connector = this.connectorFactory.get(connectorType);

      const connectionConfig = dataSource.config.connectionConfig as Record<string, unknown>;
      const result = await connector.fetch(connectionConfig);

      const fieldMappings = (dataSource.config.fieldMapping as unknown as FieldMapping[]) ?? [];
      const transformSteps = (dataSource.config.transformSteps as unknown as TransformStep[]) ?? [];

      let records = result.data;

      if (transformSteps.length > 0) {
        records = this.transformService.apply(records, transformSteps);
      }

      const mapped = this.schemaMapper.applyMapping(records, fieldMappings);

      if (mapped.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < mapped.length; i += batchSize) {
          const batch = mapped.slice(i, i + batchSize);
          await this.prisma.dataPoint.createMany({
            data: batch.map((item) => ({
              dataSourceId: dataSource.id,
              tenantId: dataSource.tenantId,
              timestamp: item.timestamp,
              dimensions: item.dimensions as Prisma.InputJsonValue,
              metrics: item.metrics as Prisma.InputJsonValue,
            })),
          });
        }
      }

      assertTransition(SyncStatus.RUNNING as SyncStatus, SyncStatus.COMPLETED);
      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: SyncStatus.COMPLETED,
          rowsIngested: mapped.length,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Sync completed for ${dataSource.name}: ${mapped.length} rows ingested`,
      );

      return { syncRunId: syncRun.id, rowsIngested: mapped.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: SyncStatus.FAILED,
          errorLog: errorMessage,
          completedAt: new Date(),
        },
      });

      this.logger.error(`Sync failed for ${dataSource.name}: ${errorMessage}`);
      throw error;
    }
  }

  async ingestWebhookData(
    dataSourceId: string,
    tenantId: string,
    records: Record<string, unknown>[],
  ): Promise<number> {
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
      include: { config: true },
    });

    if (!dataSource || !dataSource.config) {
      throw new Error(`DataSource not found: ${dataSourceId}`);
    }

    const fieldMappings = (dataSource.config.fieldMapping as unknown as FieldMapping[]) ?? [];
    const transformSteps = (dataSource.config.transformSteps as unknown as TransformStep[]) ?? [];

    let processed = records;
    if (transformSteps.length > 0) {
      processed = this.transformService.apply(processed, transformSteps);
    }

    const mapped = this.schemaMapper.applyMapping(processed, fieldMappings);

    if (mapped.length > 0) {
      await this.prisma.dataPoint.createMany({
        data: mapped.map((item) => ({
          dataSourceId: dataSource.id,
          tenantId,
          timestamp: item.timestamp,
          dimensions: item.dimensions as Prisma.InputJsonValue,
          metrics: item.metrics as Prisma.InputJsonValue,
        })),
      });
    }

    return mapped.length;
  }
}
