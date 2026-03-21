import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DataPointService } from '../datapoint/datapoint.service.js';
import { PipelineService } from '../pipeline/pipeline.service.js';

@Injectable()
export class WebhookIngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataPointService: DataPointService,
    private readonly pipelineService: PipelineService,
  ) {}

  async ingest(apiKey: string, payload: Record<string, any>) {
    // findFirst: apiKey is unique — at most one tenant
    const tenant = await this.prisma.tenant.findFirst({
      where: { apiKey },
    });
    if (!tenant) {
      throw new NotFoundException('Invalid API key');
    }

    // findFirst: looking for a WEBHOOK data source belonging to this tenant
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { tenantId: tenant.id, type: 'WEBHOOK' },
    });
    if (!dataSource) {
      throw new BadRequestException(
        'No webhook data source configured for this tenant',
      );
    }

    const events = Array.isArray(payload.events)
      ? payload.events
      : [payload];

    const syncRun = await this.pipelineService.startSync(
      tenant.id,
      dataSource.id,
    );

    try {
      const points = events.map(
        (event: Record<string, any>) => ({
          timestamp: event.timestamp
            ? new Date(event.timestamp as string)
            : new Date(),
          dimensions: (event.dimensions as Record<string, any>) ?? {},
          metrics: (event.metrics as Record<string, any>) ?? {},
        }),
      );

      await this.dataPointService.createMany(
        tenant.id,
        dataSource.id,
        points,
      );

      await this.pipelineService.updateSyncStatus(
        syncRun.id,
        'COMPLETED' as any,
        points.length,
      );

      return { ingested: points.length, syncRunId: syncRun.id };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.pipelineService.updateSyncStatus(
        syncRun.id,
        'FAILED' as any,
        0,
        errorMessage,
      );

      await this.pipelineService.createDeadLetterEvent(
        dataSource.id,
        payload,
        errorMessage,
      );

      throw error;
    }
  }
}
