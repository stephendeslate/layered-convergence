// TRACED:AE-EVENTS-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { normalizePageParams } from '@analytics-engine/shared';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: (dto.status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED') ?? 'PENDING',
        cost: dto.cost ?? 0,
        tenantId,
        dataSourceId: dto.dataSourceId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        cost: true,
        tenantId: true,
        dataSourceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          cost: true,
          tenantId: true,
          dataSourceId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst justified: fetching by ID scoped to tenant for authorization
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        cost: true,
        payload: true,
        tenantId: true,
        dataSourceId: true,
        dataSource: {
          select: { id: true, name: true, type: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, tenantId: string, dto: UpdateEventDto) {
    await this.findOne(id, tenantId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && {
          status: dto.status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
        }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.dataSourceId !== undefined && { dataSourceId: dto.dataSourceId }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        cost: true,
        tenantId: true,
        dataSourceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }
}
