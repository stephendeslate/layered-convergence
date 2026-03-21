import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';
import { DataSourceType } from '@prisma/client';

@Injectable()
export class WebhookIngestService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(dataSourceId: string, dto: WebhookPayloadDto) {
    const dataSource = await this.prisma.dataSource.findFirstOrThrow({
      where: { id: dataSourceId, type: DataSourceType.WEBHOOK },
    });

    try {
      const dataPoint = await this.prisma.dataPoint.create({
        data: {
          dataSourceId: dataSource.id,
          tenantId: dataSource.tenantId,
          timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          dimensions: toJsonField(dto.dimensions),
          metrics: toJsonField(dto.metrics),
        },
      });

      return { id: dataPoint.id, status: 'ingested' };
    } catch (error) {
      // Dead letter queue for failed ingestion
      await this.prisma.deadLetterEvent.create({
        data: {
          dataSourceId: dataSource.id,
          payload: toJsonField(dto),
          errorReason:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }
}
