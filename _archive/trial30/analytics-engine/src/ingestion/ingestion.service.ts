import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IngestWebhookDto } from './dto/ingest-webhook.dto';

@Injectable()
export class IngestionService {
  constructor(private readonly prisma: PrismaService) {}

  async ingestWebhook(dataSourceId: string, dto: IngestWebhookDto) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
    });

    if (dataSource.type !== 'webhook') {
      throw new BadRequestException('Data source is not a webhook type');
    }

    if (dataSource.status !== 'active') {
      throw new BadRequestException('Data source is not active');
    }

    try {
      return await this.prisma.dataPoint.create({
        data: {
          dataSourceId,
          timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          dimensions: (dto.dimensions || {}) as any,
          metrics: (dto.metrics || {}) as any,
        },
      });
    } catch (error) {
      await this.prisma.deadLetterEvent.create({
        data: {
          dataSourceId,
          payload: dto as any,
          errorReason: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async ingestBatch(dataSourceId: string, events: IngestWebhookDto[]) {
    const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
      where: { id: dataSourceId },
    });

    if (dataSource.status !== 'active') {
      throw new BadRequestException('Data source is not active');
    }

    const results = { ingested: 0, failed: 0, errors: [] as string[] };

    for (const event of events) {
      try {
        await this.prisma.dataPoint.create({
          data: {
            dataSourceId,
            timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
            dimensions: (event.dimensions || {}) as any,
            metrics: (event.metrics || {}) as any,
          },
        });
        results.ingested++;
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(errorMsg);
        await this.prisma.deadLetterEvent.create({
          data: {
            dataSourceId,
            payload: event as any,
            errorReason: errorMsg,
          },
        });
      }
    }

    return results;
  }

  async transform(data: Record<string, unknown>, steps: unknown[]): Promise<Record<string, unknown>> {
    let result = { ...data };

    for (const step of steps) {
      const s = step as { type: string; config: Record<string, unknown> };
      switch (s.type) {
        case 'rename': {
          const { from, to } = s.config as { from: string; to: string };
          if (from in result) {
            result[to] = result[from];
            delete result[from];
          }
          break;
        }
        case 'cast': {
          const { field, targetType } = s.config as { field: string; targetType: string };
          if (field in result) {
            if (targetType === 'number') result[field] = Number(result[field]);
            if (targetType === 'string') result[field] = String(result[field]);
            if (targetType === 'boolean') result[field] = Boolean(result[field]);
          }
          break;
        }
        case 'filter': {
          const { field, operator, value } = s.config as { field: string; operator: string; value: unknown };
          const fieldVal = result[field];
          if (operator === 'eq' && fieldVal !== value) return {};
          if (operator === 'neq' && fieldVal === value) return {};
          if (operator === 'gt' && typeof fieldVal === 'number' && fieldVal <= (value as number)) return {};
          if (operator === 'lt' && typeof fieldVal === 'number' && fieldVal >= (value as number)) return {};
          break;
        }
        case 'derive': {
          const { field, expression } = s.config as { field: string; expression: string };
          if (expression.includes('+')) {
            const parts = expression.split('+').map((p: string) => p.trim());
            const nums = parts.map((p: string) => Number(result[p]) || 0);
            result[field] = nums.reduce((a: number, b: number) => a + b, 0);
          }
          break;
        }
        default:
          break;
      }
    }

    return result;
  }
}
