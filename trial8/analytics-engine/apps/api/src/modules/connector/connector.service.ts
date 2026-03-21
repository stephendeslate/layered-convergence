import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DataPointService } from '../data-point/data-point.service';
import { SyncRunService } from '../sync-run/sync-run.service';
import { DeadLetterService } from '../dead-letter/dead-letter.service';
import { fromJsonValue } from '../../common/helpers/json.helper';

interface FieldMapping {
  [sourceField: string]: { target: string; type: 'dimension' | 'metric' };
}

interface TransformStep {
  type: 'rename' | 'cast' | 'derive' | 'filter';
  config: Record<string, unknown>;
}

@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(ConnectorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dataPointService: DataPointService,
    private readonly syncRunService: SyncRunService,
    private readonly deadLetterService: DeadLetterService,
  ) {}

  /**
   * Execute a sync for a data source. Dispatches to the appropriate
   * connector based on the data source type.
   */
  async executeSync(dataSourceId: string) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
      include: { config: true },
    });

    if (!dataSource.config) {
      throw new BadRequestException('Data source has no configuration');
    }

    const syncRun = await this.syncRunService.startRun(dataSourceId);

    try {
      let rowCount: number;

      switch (dataSource.type) {
        case 'api':
          rowCount = await this.syncFromApi(dataSource);
          break;
        case 'csv':
          rowCount = await this.syncFromCsv(dataSource);
          break;
        case 'webhook':
          // Webhook sources are push-based, not pull-based
          this.logger.log('Webhook source does not support manual sync');
          rowCount = 0;
          break;
        case 'postgresql':
          rowCount = await this.syncFromPostgresql(dataSource);
          break;
        default:
          throw new BadRequestException(`Unsupported connector type: ${dataSource.type}`);
      }

      await this.syncRunService.completeRun(syncRun.id, rowCount);
      return { syncRunId: syncRun.id, rowsIngested: rowCount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.syncRunService.failRun(syncRun.id, errorMessage);
      throw error;
    }
  }

  /**
   * Ingest a webhook event for a data source.
   * Validates the payload and creates a data point, or sends to dead letter queue.
   */
  async ingestWebhookEvent(dataSourceId: string, payload: Record<string, unknown>) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
      include: { config: true },
    });

    if (dataSource.type !== 'webhook') {
      throw new BadRequestException('Data source is not a webhook type');
    }

    try {
      const fieldMapping = dataSource.config
        ? fromJsonValue<FieldMapping>(dataSource.config.fieldMapping)
        : {};

      const mapped = this.applyFieldMapping(payload, fieldMapping);

      await this.dataPointService.create(dataSource.tenantId, {
        dataSourceId,
        timestamp: (payload.timestamp as string) ?? new Date().toISOString(),
        dimensions: mapped.dimensions,
        metrics: mapped.metrics,
      });

      return { status: 'ingested' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.deadLetterService.create(dataSourceId, payload, errorMessage);
      return { status: 'dead_letter', reason: errorMessage };
    }
  }

  private async syncFromApi(dataSource: { id: string; tenantId: string; config: { connectionConfig: unknown; fieldMapping: unknown } | null }): Promise<number> {
    this.logger.log(`Syncing from API for source ${dataSource.id}`);
    // In production, this would fetch from the configured URL
    // For demo, return simulated sync
    return 0;
  }

  private async syncFromCsv(dataSource: { id: string; tenantId: string; config: { connectionConfig: unknown; fieldMapping: unknown } | null }): Promise<number> {
    this.logger.log(`Syncing from CSV for source ${dataSource.id}`);
    return 0;
  }

  private async syncFromPostgresql(dataSource: { id: string; tenantId: string; config: { connectionConfig: unknown; fieldMapping: unknown } | null }): Promise<number> {
    this.logger.log(`Syncing from PostgreSQL for source ${dataSource.id}`);
    return 0;
  }

  private applyFieldMapping(
    payload: Record<string, unknown>,
    mapping: FieldMapping,
  ): { dimensions: Record<string, unknown>; metrics: Record<string, unknown> } {
    const dimensions: Record<string, unknown> = {};
    const metrics: Record<string, unknown> = {};

    for (const [sourceField, config] of Object.entries(mapping)) {
      const value = payload[sourceField];
      if (value === undefined) continue;

      if (config.type === 'dimension') {
        dimensions[config.target] = value;
      } else {
        metrics[config.target] = value;
      }
    }

    // Pass through unmapped fields as dimensions
    for (const [key, value] of Object.entries(payload)) {
      if (key === 'timestamp') continue;
      if (mapping[key]) continue;
      if (typeof value === 'number') {
        metrics[key] = value;
      } else {
        dimensions[key] = value;
      }
    }

    return { dimensions, metrics };
  }
}
