import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class DeadLetterService {
  private readonly logger = new Logger(DeadLetterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dataSourceId: string, payload: Record<string, unknown>, errorReason: string) {
    this.logger.warn(`Dead letter event for source ${dataSourceId}: ${errorReason}`);
    return this.prisma.deadLetterEvent.create({
      data: {
        dataSourceId,
        payload: toJsonValue(payload),
        errorReason,
      },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    return this.prisma.deadLetterEvent.findUniqueOrThrow({ where: { id } });
  }

  async retry(id: string) {
    this.logger.log(`Retrying dead letter event ${id}`);
    return this.prisma.deadLetterEvent.update({
      where: { id },
      data: { retriedAt: new Date() },
    });
  }

  async remove(id: string) {
    return this.prisma.deadLetterEvent.delete({ where: { id } });
  }
}
