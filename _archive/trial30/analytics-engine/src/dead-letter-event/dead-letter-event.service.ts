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
        errorReason: dto.errorReason,
        ...(dto.payload !== undefined && { payload: dto.payload as any }),
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

  async retry(id: string) {
    return this.prisma.deadLetterEvent.update({
      where: { id },
      data: { retriedAt: new Date() },
    });
  }

  async remove(id: string) {
    return this.prisma.deadLetterEvent.delete({ where: { id } });
  }

  async removeAll(dataSourceId: string) {
    return this.prisma.deadLetterEvent.deleteMany({ where: { dataSourceId } });
  }
}
