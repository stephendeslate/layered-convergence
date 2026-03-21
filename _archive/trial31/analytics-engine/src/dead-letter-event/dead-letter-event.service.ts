import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeadLetterEventDto } from './dto/create-dead-letter-event.dto';

@Injectable()
export class DeadLetterEventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeadLetterEventDto) {
    return this.prisma.deadLetterEvent.create({
      data: {
        dataSourceId: dto.dataSourceId,
        payload: (dto.payload || {}) as any,
        errorReason: dto.errorReason,
      },
    });
  }

  async findAll(dataSourceId?: string) {
    return this.prisma.deadLetterEvent.findMany({
      where: dataSourceId ? { dataSourceId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.deadLetterEvent.findUniqueOrThrow({ where: { id } });
  }

  async markRetried(id: string) {
    return this.prisma.deadLetterEvent.update({
      where: { id },
      data: { retriedAt: new Date() },
    });
  }

  async remove(id: string) {
    return this.prisma.deadLetterEvent.delete({ where: { id } });
  }
}
