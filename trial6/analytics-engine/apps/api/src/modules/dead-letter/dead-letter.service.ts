import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DeadLetterQueryDto } from './dto/dead-letter-query.dto';
import { fromJsonField } from '../../common/helpers/json-field.helper';
import { WebhookPayloadDto } from '../webhook-ingest/dto/webhook-payload.dto';

@Injectable()
export class DeadLetterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: DeadLetterQueryDto) {
    return this.prisma.deadLetterEvent.findMany({
      where: query.dataSourceId
        ? { dataSourceId: query.dataSourceId }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
      include: { dataSource: true },
    });
  }

  async retry(eventId: string) {
    const event = await this.prisma.deadLetterEvent.findFirstOrThrow({
      where: { id: eventId },
    });

    const payload = fromJsonField<WebhookPayloadDto>(event.payload);

    // Re-attempt ingestion
    const dataPoint = await this.prisma.dataPoint.create({
      data: {
        dataSourceId: event.dataSourceId,
        tenantId: (
          await this.prisma.dataSource.findFirstOrThrow({
            where: { id: event.dataSourceId },
          })
        ).tenantId,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        dimensions: event.payload,
        metrics: event.payload,
      },
    });

    await this.prisma.deadLetterEvent.update({
      where: { id: eventId },
      data: { retriedAt: new Date() },
    });

    return { retried: true, dataPointId: dataPoint.id };
  }

  async remove(eventId: string) {
    return this.prisma.deadLetterEvent.delete({ where: { id: eventId } });
  }
}
