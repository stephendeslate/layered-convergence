import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeadLetterService {
  private readonly logger = new Logger(DeadLetterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dataSourceId: string, payload: unknown, errorReason: string) {
    return this.prisma.deadLetterEvent.create({
      data: {
        dataSourceId,
        payload: payload as object,
        errorReason,
      },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async retry(id: string) {
    const event = await this.prisma.deadLetterEvent.findUniqueOrThrow({
      where: { id },
    });

    this.logger.log(`Retrying dead letter event: ${id}`);

    await this.prisma.deadLetterEvent.update({
      where: { id },
      data: { retriedAt: new Date() },
    });

    return event;
  }

  async remove(id: string) {
    return this.prisma.deadLetterEvent.delete({ where: { id } });
  }
}
