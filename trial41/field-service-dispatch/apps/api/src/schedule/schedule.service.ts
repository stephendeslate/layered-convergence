import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { normalizePageParams } from '@field-service-dispatch/shared';

// TRACED: FD-SCHEDULE-SERVICE
@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduleDto, tenantId: string) {
    return this.prisma.schedule.create({
      data: {
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        tenantId,
        technicianId: dto.technicianId,
        workOrderId: dto.workOrderId,
        notes: dto.notes,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        technicianId: true,
        workOrderId: true,
        notes: true,
        createdAt: true,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const skip = (p - 1) * ps;

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { tenantId },
        skip,
        take: ps,
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          technicianId: true,
          workOrderId: true,
          createdAt: true,
        },
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.schedule.count({ where: { tenantId } }),
    ]);

    return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for multi-tenant isolation
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        technician: {
          select: { id: true, name: true, email: true },
        },
        workOrder: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.schedule.delete({ where: { id } });
    return { deleted: true };
  }
}
