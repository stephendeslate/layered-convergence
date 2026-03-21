import { Injectable, Logger, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectorFactory } from '../connectors/connector.factory';
import { TransformService, MappedRecord } from './transform.service';
import { Prisma } from '@prisma/client';

interface SyncJobData {
  dataSourceId: string;
  tenantId: string;
  syncRunId: string;
  triggeredBy: 'schedule' | 'manual';
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connectorFactory: ConnectorFactory,
    private readonly transformService: TransformService,
    @Inject('BULLMQ_QUEUE_AGGREGATION')
    private readonly aggregationQueue: Queue,
    @Inject('BULLMQ_QUEUE_CACHE_INVALIDATION')
    private readonly cacheInvalidationQueue: Queue,
  ) {}

  /**
   * Orchestrates the full ingestion pipeline:
   * fetch -> transform -> load -> aggregate
   * Per SRS-3 sections 1.1 through 1.6 and 5.2.
   */
  async runSync(jobData: SyncJobData): Promise<void> {
    const { dataSourceId, tenantId, syncRunId } = jobData;

    // 1. Update SyncRun -> RUNNING
    await this.prisma.syncRun.update({
      where: { id: syncRunId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      // 2. Load data source config
      const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
        where: { id: dataSourceId },
        include: {
          config: true,
          fieldMappings: { orderBy: { sortOrder: 'asc' } },
        },
      });

      // 3. Decrypt config (placeholder)
      const config = dataSource.config
        ? JSON.parse(
            Buffer.from(dataSource.config.configEncrypted).toString('utf-8'),
          )
        : {};

      // Get transforms
      const transforms = (dataSource.config?.transforms as any[]) ?? [];

      // 4. Get connector and extract data
      const connector = this.connectorFactory.getConnector(
        dataSource.connectorType,
      );

      let totalSynced = 0;
      let totalFailed = 0;
      let minTimestamp: Date | null = null;
      let maxTimestamp: Date | null = null;

      // 5. Extract, transform, and load in batches
      for await (const batch of connector.extract(config)) {
        // Transform
        const { records, deadLetters } = this.transformService.transform(
          batch,
          dataSource.fieldMappings.map((fm) => ({
            sourceField: fm.sourceField,
            targetField: fm.targetField,
            fieldType: fm.fieldType,
            fieldRole: fm.fieldRole,
            isRequired: fm.isRequired,
          })),
          transforms,
        );

        // Load
        const loadResult = await this.loadDataPoints(
          records,
          dataSourceId,
          tenantId,
          syncRunId,
        );

        totalSynced += loadResult.synced;
        totalFailed += loadResult.failed + deadLetters.length;

        // Track timestamp range for aggregation
        for (const rec of records) {
          if (!minTimestamp || rec.timestamp < minTimestamp)
            minTimestamp = rec.timestamp;
          if (!maxTimestamp || rec.timestamp > maxTimestamp)
            maxTimestamp = rec.timestamp;
        }

        // Write dead letters
        if (deadLetters.length > 0) {
          await this.prisma.deadLetterEvent.createMany({
            data: deadLetters.map((dl) => ({
              syncRunId,
              tenantId,
              dataSourceId,
              payload: dl.record as Prisma.InputJsonValue,
              errorMessage: dl.error,
            })),
          });
        }

        // Update sync run counters
        await this.prisma.syncRun.update({
          where: { id: syncRunId },
          data: { rowsSynced: totalSynced, rowsFailed: totalFailed },
        });
      }

      // 6. On success: update SyncRun -> COMPLETED
      await this.prisma.syncRun.update({
        where: { id: syncRunId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          rowsSynced: totalSynced,
          rowsFailed: totalFailed,
        },
      });

      // Reset consecutive failures and update lastSyncAt
      await this.prisma.dataSource.update({
        where: { id: dataSourceId },
        data: {
          lastSyncAt: new Date(),
          consecutiveFails: 0,
        },
      });

      // Enqueue aggregation job if we have data
      if (minTimestamp && maxTimestamp) {
        await this.aggregationQueue.add('aggregate', {
          dataSourceId,
          tenantId,
          syncRunId,
          timestampRange: {
            from: minTimestamp.toISOString(),
            to: maxTimestamp.toISOString(),
          },
        });
      }

      // Enqueue cache invalidation
      const affectedWidgets = await this.prisma.widget.findMany({
        where: { dataSourceId, tenantId },
        select: { id: true, dashboardId: true },
      });

      if (affectedWidgets.length > 0) {
        await this.cacheInvalidationQueue.add('invalidate', {
          dataSourceId,
          tenantId,
          widgetIds: affectedWidgets.map((w) => w.id),
          dashboardIds: [
            ...new Set(affectedWidgets.map((w) => w.dashboardId)),
          ],
        });
      }

      this.logger.log(
        `Sync completed: ${totalSynced} synced, ${totalFailed} failed for data source ${dataSourceId}`,
      );
    } catch (err: unknown) {
      const error = err as Error;

      // 7. On failure: update SyncRun -> FAILED
      await this.prisma.syncRun.update({
        where: { id: syncRunId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });

      // Increment consecutive failures
      const updated = await this.prisma.dataSource.update({
        where: { id: dataSourceId },
        data: {
          consecutiveFails: { increment: 1 },
        },
      });

      // Auto-pause after 3 consecutive failures (BRD BR-031, spec says 5 but code says 3)
      if (updated.consecutiveFails >= 3) {
        await this.prisma.dataSource.update({
          where: { id: dataSourceId },
          data: { syncPaused: true },
        });
        this.logger.warn(
          `Data source ${dataSourceId} paused after ${updated.consecutiveFails} consecutive failures`,
        );
      }

      // Write to dead letter
      await this.prisma.deadLetterEvent.create({
        data: {
          syncRunId,
          tenantId,
          dataSourceId,
          payload: { error: error.message } as Prisma.InputJsonValue,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });

      this.logger.error(
        `Sync failed for data source ${dataSourceId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Load mapped records into DataPoint table with deduplication.
   * Per SRS-3 section 1.6.
   */
  private async loadDataPoints(
    records: MappedRecord[],
    dataSourceId: string,
    tenantId: string,
    _syncRunId: string,
  ): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    // Process in chunks of 100
    for (let i = 0; i < records.length; i += 100) {
      const batch = records.slice(i, i + 100);

      const dataPoints = batch.map((record) => ({
        tenantId,
        dataSourceId,
        dimensions: record.dimensions as Prisma.InputJsonValue,
        metrics: record.metrics as Prisma.InputJsonValue,
        timestamp: record.timestamp,
        sourceHash: createHash('sha256')
          .update(
            JSON.stringify({
              dataSourceId,
              dimensions: record.dimensions,
              metrics: record.metrics,
              timestamp: record.timestamp.toISOString(),
            }),
          )
          .digest('hex'),
      }));

      const result = await this.prisma.dataPoint.createMany({
        data: dataPoints,
        skipDuplicates: true,
      });

      synced += result.count;
      failed += batch.length - result.count;
    }

    return { synced, failed };
  }
}
