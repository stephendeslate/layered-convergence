import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SyncRunService } from '../sync-run/sync-run.service';
import { DataPointService } from '../data-point/data-point.service';
import { DeadLetterService } from '../dead-letter/dead-letter.service';

interface ConnectorConfig {
  url?: string;
  query?: string;
  headers?: Record<string, string>;
  jsonPath?: string;
}

interface FieldMapping {
  source: string;
  target: string;
  type: 'dimension' | 'metric';
}

interface TransformStep {
  operation: 'rename' | 'cast' | 'derive' | 'filter';
  field: string;
  value?: string;
  expression?: string;
}

@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(ConnectorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncRunService: SyncRunService,
    private readonly dataPointService: DataPointService,
    private readonly deadLetterService: DeadLetterService,
  ) {}

  /**
   * Execute a sync for a given data source.
   * Dispatches to the appropriate connector based on data source type.
   */
  async executeSync(dataSourceId: string): Promise<{ syncRunId: string; rowsIngested: number }> {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
    });

    const syncRun = await this.syncRunService.start(dataSourceId);

    try {
      let rowsIngested: number;

      switch (dataSource.type) {
        case 'api':
          rowsIngested = await this.syncApi(dataSource, syncRun.id);
          break;
        case 'csv':
          rowsIngested = await this.syncCsv(dataSource, syncRun.id);
          break;
        case 'webhook':
          // Webhook sources don't sync — they receive data via POST
          rowsIngested = 0;
          break;
        case 'postgresql':
          rowsIngested = await this.syncPostgresql(dataSource, syncRun.id);
          break;
        default:
          throw new BadRequestException(`Unsupported connector type: ${dataSource.type}`);
      }

      await this.syncRunService.complete(syncRun.id, rowsIngested);
      return { syncRunId: syncRun.id, rowsIngested };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.syncRunService.fail(syncRun.id, errorMessage);
      throw error;
    }
  }

  /**
   * Ingest a webhook event payload into data points.
   */
  async ingestWebhookEvent(
    dataSourceId: string,
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
        where: { id: dataSourceId },
      });

      const fieldMapping = dataSource.fieldMapping as unknown as FieldMapping[];
      const mapped = this.applyFieldMapping(payload, fieldMapping);

      await this.dataPointService.create(tenantId, {
        dataSourceId,
        timestamp: new Date().toISOString(),
        dimensions: mapped.dimensions,
        metrics: mapped.metrics,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.deadLetterService.create(dataSourceId, payload, errorMessage);
      this.logger.error(`Webhook ingest failed for source ${dataSourceId}: ${errorMessage}`);
    }
  }

  private async syncApi(dataSource: { id: string; tenantId: string; connectionConfig: unknown; fieldMapping: unknown }, syncRunId: string): Promise<number> {
    const config = dataSource.connectionConfig as ConnectorConfig;
    const fieldMapping = dataSource.fieldMapping as unknown as FieldMapping[];

    if (!config.url) {
      throw new BadRequestException('API connector requires a URL');
    }

    // In production, this would fetch from the configured URL.
    // For CED trials, we simulate the API response.
    this.logger.log(`API sync for source ${dataSource.id}: would fetch ${config.url}`);

    // Simulated: generate sample data points
    const now = new Date();
    const points = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(now.getTime() - i * 3600000),
      dimensions: { page: `/page-${i}`, source: 'api' },
      metrics: { views: Math.floor(Math.random() * 1000), duration: Math.floor(Math.random() * 300) },
    }));

    await this.dataPointService.createBatch(dataSource.tenantId, dataSource.id, points);
    return points.length;
  }

  private async syncCsv(dataSource: { id: string; tenantId: string; connectionConfig: unknown; fieldMapping: unknown }, syncRunId: string): Promise<number> {
    // CSV sync processes uploaded file data.
    // For CED trials, we simulate CSV parsing.
    this.logger.log(`CSV sync for source ${dataSource.id}`);

    const now = new Date();
    const points = Array.from({ length: 5 }, (_, i) => ({
      timestamp: new Date(now.getTime() - i * 86400000),
      dimensions: { category: `cat-${i}`, region: 'US' },
      metrics: { revenue: Math.floor(Math.random() * 10000), orders: Math.floor(Math.random() * 100) },
    }));

    await this.dataPointService.createBatch(dataSource.tenantId, dataSource.id, points);
    return points.length;
  }

  private async syncPostgresql(dataSource: { id: string; tenantId: string; connectionConfig: unknown; fieldMapping: unknown }, syncRunId: string): Promise<number> {
    // PostgreSQL sync executes a read-only query against an external database.
    // For CED trials, we simulate the query result.
    this.logger.log(`PostgreSQL sync for source ${dataSource.id}`);

    const now = new Date();
    const points = Array.from({ length: 8 }, (_, i) => ({
      timestamp: new Date(now.getTime() - i * 3600000),
      dimensions: { table: 'orders', status: i % 2 === 0 ? 'complete' : 'pending' },
      metrics: { count: Math.floor(Math.random() * 500), total: Math.floor(Math.random() * 50000) },
    }));

    await this.dataPointService.createBatch(dataSource.tenantId, dataSource.id, points);
    return points.length;
  }

  private applyFieldMapping(
    data: Record<string, unknown>,
    mapping: FieldMapping[],
  ): { dimensions: Record<string, unknown>; metrics: Record<string, unknown> } {
    const dimensions: Record<string, unknown> = {};
    const metrics: Record<string, unknown> = {};

    for (const map of mapping) {
      const value = data[map.source];
      if (value !== undefined) {
        if (map.type === 'dimension') {
          dimensions[map.target] = value;
        } else {
          metrics[map.target] = typeof value === 'string' ? parseFloat(value) || 0 : value;
        }
      }
    }

    return { dimensions, metrics };
  }
}
