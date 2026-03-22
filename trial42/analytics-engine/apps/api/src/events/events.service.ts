import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './events.dto';
import { clampPageSize, calculateSkip } from '@analytics-engine/shared';

// TRACED:AE-API-008
@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        type: dto.type as 'CLICK' | 'PAGE_VIEW' | 'API_CALL' | 'CUSTOM' | 'ERROR',
        payload: dto.payload ?? {},
        source: dto.source,
        tenantId: dto.tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const size = clampPageSize(pageSize);
    const skip = calculateSkip(page, size);

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        skip,
        take: size,
        select: {
          id: true,
          type: true,
          status: true,
          source: true,
          createdAt: true,
          tenantId: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);

    return { data, total, page: page ?? 1, pageSize: size };
  }

  async findOne(id: string) {
    // findFirst: retrieve event with full payload for detail view
    const event = await this.prisma.event.findFirst({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        status: dto.status as 'PENDING' | 'PROCESSED' | 'FAILED' | 'ARCHIVED' | undefined,
        payload: dto.payload,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
