import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IngestWebhookDto } from './ingestion.dto';

@Injectable()
export class IngestionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process a webhook ingestion event.
   * Validates the data source is of type WEBHOOK, applies field mapping,
   * and stores the data point. Failed events go to dead letter queue.
   */
  async ingestWebhook(tenantId: string, dataSourceId: string, dto: IngestWebhookDto) {
    const dataSource = await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, tenantId, type: 'WEBHOOK' },
      include: { config: true },
    });

    const syncRun = await this.prisma.syncRun.create({
      data: { dataSourceId, status: 'RUNNING' },
    });

    try {
      const fieldMapping = (dataSource.config?.fieldMapping as Record<string, string>) ?? {};
      const dimensions: Record<string, unknown> = {};
      const metrics: Record<string, unknown> = {};

      // Apply field mapping
      for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
        const value = dto.payload[sourceField];
        if (value !== undefined) {
          if (typeof value === 'number') {
            metrics[targetField] = value;
          } else {
            dimensions[targetField] = value;
          }
        }
      }

      // If no field mapping, use payload as-is
      if (Object.keys(fieldMapping).length === 0) {
        for (const [key, value] of Object.entries(dto.payload)) {
          if (typeof value === 'number') {
            metrics[key] = value;
          } else {
            dimensions[key] = value;
          }
        }
      }

      await this.prisma.dataPoint.create({
        data: {
          tenantId,
          dataSourceId,
          timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          dimensions,
          metrics,
        },
      });

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: 'COMPLETED', rowsIngested: 1, completedAt: new Date() },
      });

      return { success: true, syncRunId: syncRun.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.$transaction([
        this.prisma.syncRun.update({
          where: { id: syncRun.id },
          data: { status: 'FAILED', errorLog: errorMessage, completedAt: new Date() },
        }),
        this.prisma.deadLetterEvent.create({
          data: {
            dataSourceId,
            payload: dto.payload as Record<string, unknown>,
            errorReason: errorMessage,
          },
        }),
      ]);

      throw new BadRequestException(`Ingestion failed: ${errorMessage}`);
    }
  }

  /**
   * Retry a dead letter event by re-processing its payload.
   */
  async retryDeadLetter(tenantId: string, deadLetterId: string) {
    const deadLetter = await this.prisma.deadLetterEvent.findFirstOrThrow({
      where: { id: deadLetterId },
      include: { dataSource: true },
    });

    if (deadLetter.dataSource.tenantId !== tenantId) {
      throw new BadRequestException('Dead letter event not found for this tenant');
    }

    const result = await this.ingestWebhook(tenantId, deadLetter.dataSourceId, {
      payload: deadLetter.payload as Record<string, unknown>,
    });

    await this.prisma.deadLetterEvent.update({
      where: { id: deadLetterId },
      data: { retriedAt: new Date() },
    });

    return result;
  }

  async getDeadLetters(tenantId: string, dataSourceId: string) {
    await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, tenantId },
    });

    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
