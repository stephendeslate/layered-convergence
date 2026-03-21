import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeadLetterService {
  private readonly logger = new Logger(DeadLetterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enqueue(
    dataSourceId: string,
    tenantId: string,
    payload: Record<string, unknown>,
    errorReason: string,
  ): Promise<string> {
    const event = await this.prisma.deadLetterEvent.create({
      data: {
        dataSourceId,
        tenantId,
        payload: payload as Prisma.InputJsonValue,
        errorReason,
      },
    });

    this.logger.warn(
      `Dead letter event created: ${event.id} for dataSource: ${dataSourceId}, reason: ${errorReason}`,
    );

    return event.id;
  }

  async findAll(
    tenantId: string,
    dataSourceId?: string,
    cursor?: string,
    limit: number = 20,
  ) {
    const take = Math.min(limit, 100);
    const where: Record<string, unknown> = { tenantId };
    if (dataSourceId) {
      where.dataSourceId = dataSourceId;
    }

    const events = await this.prisma.deadLetterEvent.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = events.length > take;
    const data = hasMore ? events.slice(0, take) : events;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  async retry(tenantId: string, eventId: string): Promise<Record<string, unknown>> {
    const event = await this.prisma.deadLetterEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      throw new Error('Dead letter event not found');
    }

    await this.prisma.deadLetterEvent.update({
      where: { id: eventId },
      data: { retriedAt: new Date() },
    });

    return event.payload as Record<string, unknown>;
  }
}
