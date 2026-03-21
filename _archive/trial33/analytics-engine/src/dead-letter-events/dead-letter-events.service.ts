import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeadLetterEventDto } from './dto/create-dead-letter-event.dto';

@Injectable()
export class DeadLetterEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.deadLetterEvent.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.deadLetterEvent.findUnique({
      where: { id },
    });
    if (!event) throw new NotFoundException('Dead letter event not found');
    return event;
  }

  async create(dto: CreateDeadLetterEventDto) {
    return this.prisma.deadLetterEvent.create({
      data: {
        sourceType: dto.sourceType,
        payload: (dto.payload ?? {}) as Prisma.InputJsonValue,
        errorReason: dto.errorReason,
      },
    });
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
