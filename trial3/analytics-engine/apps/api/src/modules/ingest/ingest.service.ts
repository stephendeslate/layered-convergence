import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface IngestPayload {
  timestamp: string | Date;
  dimensions: Record<string, unknown>;
  metrics: Record<string, unknown>;
}

@Injectable()
export class IngestService {
  constructor(private readonly prisma: PrismaService) {}

  async ingestBatch(dataSourceId: string, tenantId: string, records: IngestPayload[]) {
    // Verify data source belongs to tenant
    const dataSource = await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, tenantId, isActive: true },
    });

    if (records.length === 0) {
      throw new BadRequestException('Empty batch');
    }

    if (records.length > 10000) {
      throw new BadRequestException('Batch size exceeds maximum of 10,000 records');
    }

    // Create sync run
    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId: dataSource.id,
        status: 'RUNNING',
      },
    });

    try {
      const dataPoints = records.map((record) => ({
        dataSourceId: dataSource.id,
        tenantId,
        timestamp: new Date(record.timestamp),
        dimensions: record.dimensions,
        metrics: record.metrics,
      }));

      const result = await this.prisma.dataPoint.createMany({ data: dataPoints });

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'COMPLETED',
          rowsIngested: result.count,
          completedAt: new Date(),
        },
      });

      return { syncRunId: syncRun.id, rowsIngested: result.count };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'FAILED',
          errorLog: errorMessage,
          completedAt: new Date(),
        },
      });

      // Write to dead letter queue
      await this.prisma.deadLetterEvent.create({
        data: {
          dataSourceId: dataSource.id,
          payload: records as never,
          errorReason: errorMessage,
        },
      });

      throw error;
    }
  }

  async ingestWebhook(webhookToken: string, payload: IngestPayload[]) {
    const dataSource = await this.prisma.dataSource.findFirstOrThrow({
      where: { webhookToken, isActive: true },
    });

    return this.ingestBatch(dataSource.id, dataSource.tenantId, payload);
  }

  async getDeadLetters(dataSourceId: string, tenantId: string) {
    await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, tenantId },
    });

    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async retryDeadLetter(deadLetterId: string, tenantId: string) {
    const deadLetter = await this.prisma.deadLetterEvent.findFirstOrThrow({
      where: { id: deadLetterId },
      include: { dataSource: true },
    });

    if (deadLetter.dataSource.tenantId !== tenantId) {
      // Throw same error type to avoid leaking info about other tenants
      throw new BadRequestException('Dead letter event not found');
    }

    const payload = deadLetter.payload as unknown as IngestPayload[];
    const result = await this.ingestBatch(deadLetter.dataSourceId, tenantId, payload);

    await this.prisma.deadLetterEvent.update({
      where: { id: deadLetterId },
      data: { retriedAt: new Date() },
    });

    return result;
  }
}
