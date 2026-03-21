import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

const SCHEDULE_INTERVALS_MS: Record<string, number> = {
  EVERY_15_MIN: 15 * 60 * 1000,
  HOURLY: 60 * 60 * 1000,
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
};

@Injectable()
export class SyncSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SyncSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('BULLMQ_QUEUE_DATA_SYNC')
    private readonly syncQueue: Queue,
  ) {}

  async onModuleInit() {
    // Only start scheduler in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      await this.startScheduler();
    }
  }

  /**
   * Set up a repeatable job that checks for due syncs every minute.
   */
  async startScheduler(): Promise<void> {
    await this.syncQueue.add(
      'check-due-syncs',
      {},
      {
        repeat: { every: 60_000 }, // Every minute
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    this.logger.log('Sync scheduler started (checking every 60s)');
  }

  /**
   * Check for data sources due for sync and enqueue jobs.
   * Per SRS-3 section 8.1.
   */
  async checkDueSyncs(): Promise<number> {
    const now = new Date();

    const dueSources = await this.prisma.dataSource.findMany({
      where: {
        syncPaused: false,
        syncSchedule: { not: 'MANUAL' },
        nextSyncAt: { lte: now },
      },
      select: { id: true, tenantId: true, syncSchedule: true },
    });

    let enqueued = 0;

    for (const source of dueSources) {
      // Check no active sync
      const activeRun = await this.prisma.syncRun.findFirst({
        where: { dataSourceId: source.id, status: 'RUNNING' },
      });
      if (activeRun) continue;

      // Create sync run
      const syncRun = await this.prisma.syncRun.create({
        data: {
          dataSourceId: source.id,
          tenantId: source.tenantId,
          status: 'IDLE',
        },
      });

      // Enqueue sync job
      await this.syncQueue.add(
        'sync',
        {
          dataSourceId: source.id,
          tenantId: source.tenantId,
          syncRunId: syncRun.id,
          triggeredBy: 'schedule',
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      );

      // Update nextSyncAt
      const intervalMs = SCHEDULE_INTERVALS_MS[source.syncSchedule] ?? 0;
      if (intervalMs > 0) {
        await this.prisma.dataSource.update({
          where: { id: source.id },
          data: { nextSyncAt: new Date(Date.now() + intervalMs) },
        });
      }

      enqueued++;
    }

    if (enqueued > 0) {
      this.logger.log(`Enqueued ${enqueued} scheduled sync(s)`);
    }

    return enqueued;
  }

  /**
   * Schedule or reschedule sync for a specific data source.
   */
  async scheduleSync(
    dataSourceId: string,
    syncSchedule: string,
  ): Promise<void> {
    const intervalMs = SCHEDULE_INTERVALS_MS[syncSchedule];
    if (!intervalMs) return; // MANUAL — no scheduling

    await this.prisma.dataSource.update({
      where: { id: dataSourceId },
      data: { nextSyncAt: new Date(Date.now() + intervalMs) },
    });
  }

  /**
   * Remove scheduled sync for a data source.
   */
  async unscheduleSync(dataSourceId: string): Promise<void> {
    await this.prisma.dataSource.update({
      where: { id: dataSourceId },
      data: { nextSyncAt: null },
    });
  }
}
