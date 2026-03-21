import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DeadLetterService {
  private readonly logger = new Logger(DeadLetterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dataSourceId: string, payload: Record<string, unknown>, errorReason: string) {
    const event = await this.prisma.deadLetterEvent.create({
      data: { dataSourceId, payload, errorReason },
    });
    this.logger.warn(`Dead letter event created: ${event.id} — ${errorReason}`);
    return event;
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async retry(id: string) {
    return this.prisma.deadLetterEvent.update({
      where: { id },
      data: { retriedAt: new Date() },
    });
  }

  async delete(id: string) {
    return this.prisma.deadLetterEvent.delete({ where: { id } });
  }
}
