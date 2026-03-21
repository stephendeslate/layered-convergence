import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeadLetterEventDto } from './dto/create-dead-letter-event.dto';

@Injectable()
export class DeadLetterEventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDeadLetterEventDto) {
    return this.prisma.deadLetterEvent.create({
      data: {
        dataSourceId: dto.dataSourceId,
        payload: dto.payload,
        errorReason: dto.errorReason,
      },
    });
  }

  async findByDataSource(dataSourceId: string) {
    return this.prisma.deadLetterEvent.findMany({
      where: { dataSourceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.deadLetterEvent.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`DeadLetterEvent ${id} not found`);
    }
    return event;
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
}
