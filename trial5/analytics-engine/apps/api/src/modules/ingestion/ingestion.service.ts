import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncRunStatus, DataSourceType } from '@prisma/client';
import { WebhookIngestDto } from './dto/webhook-ingest.dto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ingestWebhook(dataSourceId: string, dto: WebhookIngestDto) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
    });

    if (dataSource.type !== DataSourceType.WEBHOOK) {
      throw new Error('Data source is not a webhook type');
    }

    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId,
        status: SyncRunStatus.RUNNING,
      },
    });

    try {
      const points = dto.events.map((event) => ({
        tenantId: dataSource.tenantId,
        dataSourceId,
        timestamp: new Date(event.timestamp),
        dimensions: event.dimensions || {},
        metrics: event.metrics || {},
      }));

      await this.prisma.dataPoint.createMany({ data: points });

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: SyncRunStatus.COMPLETED,
          rowsIngested: points.length,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Webhook ingested ${points.length} events for data source ${dataSourceId}`);

      return { syncRunId: syncRun.id, rowsIngested: points.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: SyncRunStatus.FAILED,
          errorLog: errorMessage,
          completedAt: new Date(),
        },
      });

      // Store in dead letter queue
      await this.prisma.deadLetterEvent.create({
        data: {
          dataSourceId,
          // [JUSTIFIED:TYPE_CAST] DTO class to Prisma Json — structurally compatible but types differ
          payload: dto as unknown as Record<string, unknown>,
          errorReason: errorMessage,
        },
      });

      throw error;
    }
  }

  async ingestCsv(dataSourceId: string, rows: Array<Record<string, unknown>>, fieldMapping: Record<string, string>) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
    });

    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId,
        status: SyncRunStatus.RUNNING,
      },
    });

    try {
      const points = rows.map((row) => {
        const dimensions: Record<string, unknown> = {};
        const metrics: Record<string, unknown> = {};

        for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
          if (targetField.startsWith('dim:')) {
            dimensions[targetField.replace('dim:', '')] = row[sourceField];
          } else if (targetField.startsWith('metric:')) {
            metrics[targetField.replace('metric:', '')] = Number(row[sourceField]) || 0;
          }
        }

        return {
          tenantId: dataSource.tenantId,
          dataSourceId,
          timestamp: new Date(row[fieldMapping['timestamp'] || 'timestamp'] as string || new Date()),
          dimensions,
          metrics,
        };
      });

      await this.prisma.dataPoint.createMany({ data: points });

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: SyncRunStatus.COMPLETED,
          rowsIngested: points.length,
          completedAt: new Date(),
        },
      });

      return { syncRunId: syncRun.id, rowsIngested: points.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: SyncRunStatus.FAILED,
          errorLog: errorMessage,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  async retryDeadLetter(deadLetterEventId: string) {
    const dle = await this.prisma.deadLetterEvent.findUniqueOrThrow({
      where: { id: deadLetterEventId },
    });

    await this.prisma.deadLetterEvent.update({
      where: { id: deadLetterEventId },
      data: { retriedAt: new Date() },
    });

    // [JUSTIFIED:TYPE_CAST] Prisma Json to DTO class — payload was originally a WebhookIngestDto
    return this.ingestWebhook(dle.dataSourceId, dle.payload as unknown as WebhookIngestDto);
  }

  async getDeadLetterEvents(dataSourceId: string) {
    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
