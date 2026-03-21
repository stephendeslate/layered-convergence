import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DataPointService } from '../data-point/data-point.service';
import { SyncRunService } from '../sync-run/sync-run.service';
import { DeadLetterService } from '../dead-letter/dead-letter.service';
import { SseService } from '../sse/sse.service';
import { IngestWebhookDto } from './dto/ingest-webhook.dto';
import { fromJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(ConnectorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dataPointService: DataPointService,
    private readonly syncRunService: SyncRunService,
    private readonly deadLetterService: DeadLetterService,
    private readonly sseService: SseService,
  ) {}

  /**
   * Ingest data via webhook connector.
   * Rate-limited per data source. Max payload 1MB enforced at controller level.
   */
  async ingestWebhook(dataSourceId: string, dto: IngestWebhookDto) {
    const dataSource = await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, type: 'WEBHOOK' },
      include: { config: true },
    });

    try {
      const fieldMapping = dataSource.config
        ? fromJsonField<Record<string, string>>(dataSource.config.fieldMapping)
        : {};

      const mappedDimensions = this.applyFieldMapping(
        dto.dimensions ?? {},
        fieldMapping,
      );
      const mappedMetrics = dto.metrics ?? {};

      const point = await this.dataPointService.create({
        dataSourceId,
        timestamp: dto.timestamp,
        dimensions: mappedDimensions,
        metrics: mappedMetrics,
      });

      // Publish SSE event for real-time dashboard updates
      const dashboards = await this.prisma.dashboard.findMany({
        where: { tenantId: dataSource.tenantId, isPublished: true },
      });

      for (const dashboard of dashboards) {
        this.sseService.publish({
          tenantId: dataSource.tenantId,
          dashboardId: dashboard.id,
          type: 'data-point-ingested',
          data: { dataSourceId, timestamp: dto.timestamp },
        });
      }

      return point;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.deadLetterService.create(
        dataSourceId,
        { timestamp: dto.timestamp, dimensions: dto.dimensions, metrics: dto.metrics },
        errorMessage,
      );
      throw new BadRequestException(`Ingestion failed: ${errorMessage}`);
    }
  }

  /**
   * Trigger a manual sync for an API or PostgreSQL connector.
   */
  async triggerSync(dataSourceId: string) {
    const dataSource = await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId },
      include: { config: true },
    });

    if (dataSource.type === 'WEBHOOK') {
      throw new BadRequestException('Webhook connectors do not support manual sync');
    }

    const syncRun = await this.syncRunService.create(dataSourceId);

    try {
      // Simulated sync — in production, this would call the external source
      this.logger.log(`Starting sync for data source ${dataSourceId} (type: ${dataSource.type})`);

      const rowsIngested = 0; // Placeholder for actual connector implementation
      await this.syncRunService.complete(syncRun.id, rowsIngested);

      return { syncRunId: syncRun.id, status: 'completed', rowsIngested };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.syncRunService.fail(syncRun.id, errorMessage);
      return { syncRunId: syncRun.id, status: 'failed', error: errorMessage };
    }
  }

  private applyFieldMapping(
    data: Record<string, string>,
    mapping: Record<string, string>,
  ): Record<string, string> {
    if (Object.keys(mapping).length === 0) return data;

    const result: Record<string, string> = {};
    for (const [sourceKey, targetKey] of Object.entries(mapping)) {
      if (data[sourceKey] !== undefined) {
        result[targetKey] = data[sourceKey];
      }
    }
    return result;
  }
}
