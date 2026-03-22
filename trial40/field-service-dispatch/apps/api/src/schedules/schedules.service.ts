// TRACED: FD-SCHED-003 — Schedules service with tenant scoping
// TRACED: FD-DB-006 — N+1 prevention via include for schedule relations
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { paginate } from '@field-service-dispatch/shared';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateScheduleDto) {
    // findFirst: verify work order belongs to tenant
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, tenantId },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return this.prisma.schedule.create({
      data: {
        workOrderId: dto.workOrderId,
        technicianId: dto.technicianId,
        scheduledAt: new Date(dto.scheduledAt),
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { workOrder: { tenantId } },
        include: { workOrder: true, technician: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.schedule.count({ where: { workOrder: { tenantId } } }),
    ]);

    return paginate(items, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: tenant-scoped lookup via workOrder relation
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, workOrder: { tenantId } },
      include: { workOrder: true, technician: true },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(tenantId: string, id: string, dto: UpdateScheduleDto) {
    // findFirst: verify tenant ownership before schedule update
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, workOrder: { tenantId } },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.technicianId !== undefined) data.technicianId = dto.technicianId;
    if (dto.scheduledAt !== undefined) data.scheduledAt = new Date(dto.scheduledAt);

    return this.prisma.schedule.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    // findFirst: verify tenant ownership before schedule delete
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, workOrder: { tenantId } },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.schedule.delete({ where: { id } });
  }
}
