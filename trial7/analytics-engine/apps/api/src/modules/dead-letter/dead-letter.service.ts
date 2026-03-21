import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class DeadLetterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dataSourceId: string, payload: Record<string, unknown>, errorReason: string) {
    return this.prisma.deadLetterEvent.create({
      data: {
        dataSourceId,
        payload: toJsonField(payload),
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

  async findOneOrThrow(id: string) {
    return this.prisma.deadLetterEvent.findFirstOrThrow({ where: { id } });
  }

  async markRetried(id: string) {
    await this.prisma.deadLetterEvent.findFirstOrThrow({ where: { id } });
    return this.prisma.deadLetterEvent.update({
      where: { id },
      data: { retriedAt: new Date() },
    });
  }

  async remove(id: string) {
    await this.prisma.deadLetterEvent.findFirstOrThrow({ where: { id } });
    return this.prisma.deadLetterEvent.delete({ where: { id } });
  }
}
