import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('BULLMQ_QUEUE_DATA_SYNC')
    private readonly syncQueue: Queue,
  ) {}

  /**
   * Get paginated sync history for a data source.
   */
  async getSyncHistory(
    dataSourceId: string,
    tenantId: string,
    query: { cursor?: string; limit?: number; status?: string } = {},
  ) {
    // Verify data source exists
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });
    if (!dataSource) throw new NotFoundException('Data source not found');

    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { dataSourceId, tenantId };
    if (query.status) where.status = query.status;

    const syncRuns = await this.prisma.syncRun.findMany({
      where: where as any,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        rowsSynced: true,
        rowsFailed: true,
        errorMessage: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
    });

    const hasMore = syncRuns.length > limit;
    const items = hasMore ? syncRuns.slice(0, limit) : syncRuns;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    // Compute duration for each sync run
    const itemsWithDuration = items.map((run) => ({
      ...run,
      durationMs:
        run.startedAt && run.completedAt
          ? run.completedAt.getTime() - run.startedAt.getTime()
          : null,
    }));

    return {
      data: itemsWithDuration,
      meta: { pagination: { cursor: nextCursor, hasMore, limit } },
    };
  }

  /**
   * Get detailed sync run with error log.
   */
  async getSyncRun(id: string, tenantId: string) {
    const syncRun = await this.prisma.syncRun.findFirst({
      where: { id, tenantId },
      include: {
        deadLetterEvents: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        dataSource: {
          select: { id: true, name: true, connectorType: true },
        },
      },
    });

    if (!syncRun) throw new NotFoundException('Sync run not found');

    return {
      ...syncRun,
      durationMs:
        syncRun.startedAt && syncRun.completedAt
          ? syncRun.completedAt.getTime() - syncRun.startedAt.getTime()
          : null,
    };
  }

  /**
   * Get dead letter events for a data source with pagination.
   */
  async getDeadLetterEvents(
    dataSourceId: string,
    tenantId: string,
    query: { cursor?: string; limit?: number } = {},
  ) {
    // Verify data source exists
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });
    if (!dataSource) throw new NotFoundException('Data source not found');

    const limit = Math.min(query.limit ?? 20, 100);

    const events = await this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId, tenantId },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      data: items,
      meta: { pagination: { cursor: nextCursor, hasMore, limit } },
    };
  }

  /**
   * Retry a single dead letter event by re-enqueueing it for processing.
   */
  async retryDeadLetterEvent(id: string, tenantId: string) {
    const event = await this.prisma.deadLetterEvent.findFirst({
      where: { id, tenantId },
    });
    if (!event) throw new NotFoundException('Dead letter event not found');

    // Enqueue a retry sync job
    await this.syncQueue.add(
      'dead-letter-retry',
      {
        deadLetterEventId: id,
        dataSourceId: event.dataSourceId,
        tenantId: event.tenantId,
        payload: event.payload,
      },
      {
        attempts: 1,
        backoff: { type: 'fixed', delay: 1000 },
      },
    );

    // Delete the dead letter event since it's being retried
    await this.prisma.deadLetterEvent.delete({ where: { id } });

    this.logger.log(`Retrying dead letter event ${id}`);

    return { message: 'Dead letter event queued for retry', id };
  }

  /**
   * Retry all dead letter events for a data source.
   */
  async retryAllDeadLetters(dataSourceId: string, tenantId: string) {
    // Verify data source exists
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });
    if (!dataSource) throw new NotFoundException('Data source not found');

    const events = await this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId, tenantId },
    });

    if (events.length === 0) {
      return { message: 'No dead letter events to retry', count: 0 };
    }

    // Enqueue all for retry
    for (const event of events) {
      await this.syncQueue.add(
        'dead-letter-retry',
        {
          deadLetterEventId: event.id,
          dataSourceId: event.dataSourceId,
          tenantId: event.tenantId,
          payload: event.payload,
        },
        {
          attempts: 1,
          backoff: { type: 'fixed', delay: 1000 },
        },
      );
    }

    // Delete all dead letter events
    const deleted = await this.prisma.deadLetterEvent.deleteMany({
      where: { dataSourceId, tenantId },
    });

    this.logger.log(
      `Retrying ${deleted.count} dead letter events for data source ${dataSourceId}`,
    );

    return {
      message: `${deleted.count} dead letter events queued for retry`,
      count: deleted.count,
    };
  }
}
