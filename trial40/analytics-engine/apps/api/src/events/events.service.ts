// TRACED:AE-API-01 — Events CRUD service with Prisma select/include optimization
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams, paginate, PaginatedResult } from '@analytics-engine/shared';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto): Promise<Record<string, unknown>> {
    return this.prisma.event.create({
      data: {
        type: dto.type as 'PAGE_VIEW' | 'CLICK' | 'CONVERSION' | 'CUSTOM',
        name: dto.name,
        payload: dto.payload || {},
        tenantId: dto.tenantId,
      },
      select: {
        id: true,
        type: true,
        name: true,
        payload: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const params = normalizePageParams(page, pageSize);
    const { skip, take } = paginate(params);

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        select: {
          id: true,
          type: true,
          name: true,
          createdAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);

    return {
      data,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    // findFirst justified: lookup by primary key for detail endpoint
    const event = await this.prisma.event.findFirst({
      where: { id },
      include: { tenant: { select: { id: true, name: true, slug: true } } },
    });

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Record<string, unknown>> {
    await this.findOne(id);

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type as 'PAGE_VIEW' | 'CLICK' | 'CONVERSION' | 'CUSTOM' }),
        ...(dto.name && { name: dto.name }),
        ...(dto.payload !== undefined && { payload: dto.payload }),
      },
      select: {
        id: true,
        type: true,
        name: true,
        payload: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }
}
