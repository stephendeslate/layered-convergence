import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SyncRunStatus } from '../../generated/prisma/client.js';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerSync(dataSourceId: string, tenantId: string) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId, tenantId },
      include: { dataSourceConfig: true },
    });

    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId: dataSource.id,
        status: SyncRunStatus.RUNNING,
      },
    });

    this.executeSyncInBackground(syncRun.id, dataSource.id, tenantId).catch(
      (err) => this.logger.error(`Background sync failed: ${err.message}`),
    );

    return syncRun;
  }

  async executeSyncInBackground(
    syncRunId: string,
    dataSourceId: string,
    tenantId: string,
  ) {
    try {
      const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
        where: { id: dataSourceId },
        include: { dataSourceConfig: true },
      });

      const dataPoints = this.generateSampleDataPoints(
        dataSourceId,
        tenantId,
        dataSource.dataSourceConfig,
      );

      let rowsIngested = 0;
      for (const point of dataPoints) {
        try {
          await this.prisma.dataPoint.create({ data: point });
          rowsIngested++;
        } catch (err) {
          // type assertion justified: err from catch is unknown by default
          const error = err as Error;
          await this.prisma.deadLetterEvent.create({
            data: {
              dataSourceId,
              payload: point.dimensions,
              errorReason: error.message,
            },
          });
        }
      }

      await this.transitionStatus(
        syncRunId,
        SyncRunStatus.RUNNING,
        SyncRunStatus.COMPLETED,
        rowsIngested,
      );
    } catch (err) {
      // type assertion justified: err from catch is unknown by default
      const error = err as Error;
      await this.transitionStatus(
        syncRunId,
        SyncRunStatus.RUNNING,
        SyncRunStatus.FAILED,
        0,
        error.message,
      );
    }
  }

  async transitionStatus(
    syncRunId: string,
    from: SyncRunStatus,
    to: SyncRunStatus,
    rowsIngested?: number,
    errorLog?: string,
  ) {
    this.validateTransition(from, to);

    const syncRun = await this.prisma.syncRun.findUniqueOrThrow({
      where: { id: syncRunId },
    });

    if (syncRun.status !== from) {
      // Convention 5.24: use BadRequestException for invalid state machine transitions
      throw new BadRequestException(
        `Cannot transition from ${syncRun.status} to ${to}. Expected current status: ${from}`,
      );
    }

    return this.prisma.syncRun.update({
      where: { id: syncRunId },
      data: {
        status: to,
        ...(rowsIngested !== undefined ? { rowsIngested } : {}),
        ...(errorLog !== undefined ? { errorLog } : {}),
        ...(to === SyncRunStatus.COMPLETED || to === SyncRunStatus.FAILED
          ? { completedAt: new Date() }
          : {}),
      },
    });
  }

  validateTransition(from: SyncRunStatus, to: SyncRunStatus) {
    const validTransitions: Record<SyncRunStatus, SyncRunStatus[]> = {
      [SyncRunStatus.RUNNING]: [
        SyncRunStatus.COMPLETED,
        SyncRunStatus.FAILED,
      ],
      [SyncRunStatus.COMPLETED]: [],
      [SyncRunStatus.FAILED]: [],
    };

    if (!validTransitions[from]?.includes(to)) {
      // Convention 5.24: use BadRequestException for invalid state machine transitions
      throw new BadRequestException(
        `Invalid state transition: ${from} → ${to}`,
      );
    }
  }

  async getSyncRuns(dataSourceId: string) {
    return this.prisma.syncRun.findMany({
      where: { dataSourceId },
      orderBy: { startedAt: 'desc' },
    });
  }

  private generateSampleDataPoints(
    dataSourceId: string,
    tenantId: string,
    _config: unknown,
  ) {
    const now = new Date();
    return [
      {
        dataSourceId,
        tenantId,
        timestamp: now,
        dimensions: { region: 'us-east', product: 'widget-a' },
        metrics: { revenue: 1500, units: 10 },
      },
      {
        dataSourceId,
        tenantId,
        timestamp: new Date(now.getTime() - 3600000),
        dimensions: { region: 'eu-west', product: 'widget-b' },
        metrics: { revenue: 2300, units: 15 },
      },
    ];
  }
}
