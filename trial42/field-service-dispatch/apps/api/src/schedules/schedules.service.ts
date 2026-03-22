// TRACED: FD-SCHEDULES-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePageParams } from '@field-service-dispatch/shared';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: {
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        status: dto.status as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | undefined,
        tenantId: dto.tenantId,
        technicianId: dto.technicianId,
        workOrderId: dto.workOrderId,
        notes: dto.notes,
      },
      include: { technician: true, workOrder: true },
    });
  }

  async findAll(page?: number, pageSize?: number, tenantId?: string) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const where = tenantId ? { tenantId } : {};

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        include: { technician: true, workOrder: true },
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return {
      data,
      total,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(total / ps),
    };
  }

  async findOne(id: string) {
    // findFirst justification: lookup by primary key with related data
    const schedule = await this.prisma.schedule.findFirst({
      where: { id },
      include: { technician: true, workOrder: true },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule ${id} not found`);
    }

    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    if (dto.status) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.schedule.update({
      where: { id },
      data,
      include: { technician: true, workOrder: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.schedule.delete({ where: { id } });
  }
}
