import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface AvailabilityWindow {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface SetScheduleDto {
  technicianId: string;
  availability: AvailabilityWindow[];
}

export interface ScheduleQuery {
  date?: string;
  technicianId?: string;
  from?: string;
  to?: string;
}

export interface ScheduleConflict {
  workOrderId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  conflictType: 'overlap' | 'outside_availability';
}

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Set availability windows for a technician.
   * Stored as JSON in the technician's schedule field.
   */
  async setAvailability(
    companyId: string,
    dto: SetScheduleDto,
    userId?: string,
  ) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: dto.technicianId, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${dto.technicianId} not found`);
    }

    // Validate availability windows
    for (const window of dto.availability) {
      if (window.dayOfWeek < 0 || window.dayOfWeek > 6) {
        throw new BadRequestException(
          `Invalid day of week: ${window.dayOfWeek}. Must be 0-6.`,
        );
      }
      if (!this.isValidTime(window.startTime) || !this.isValidTime(window.endTime)) {
        throw new BadRequestException(
          `Invalid time format. Use HH:mm.`,
        );
      }
      if (window.startTime >= window.endTime) {
        throw new BadRequestException(
          `Start time must be before end time for day ${window.dayOfWeek}.`,
        );
      }
    }

    const updated = await this.prisma.technician.update({
      where: { id: dto.technicianId },
      data: {
        schedule: { availability: dto.availability } as any,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'schedule.set_availability',
      entityType: 'Technician',
      entityId: dto.technicianId,
      metadata: { windowCount: dto.availability.length },
    });

    return {
      technicianId: updated.id,
      technicianName: `${updated.user.firstName} ${updated.user.lastName}`,
      availability: dto.availability,
    };
  }

  /**
   * Get a technician's availability windows.
   */
  async getAvailability(companyId: string, technicianId: string) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${technicianId} not found`);
    }

    const schedule = (technician.schedule as any) ?? {};
    const availability: AvailabilityWindow[] = schedule.availability ?? [];

    return {
      technicianId: technician.id,
      technicianName: `${technician.user.firstName} ${technician.user.lastName}`,
      availability,
    };
  }

  /**
   * Get daily schedule: work orders assigned to a technician on a specific date.
   */
  async getDailySchedule(
    companyId: string,
    technicianId: string,
    date: string,
  ) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${technicianId} not found`);
    }

    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        technicianId,
        scheduledStart: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['CANCELLED'] },
      },
      include: { customer: true },
      orderBy: { scheduledStart: 'asc' },
    });

    return {
      technicianId,
      technicianName: `${technician.user.firstName} ${technician.user.lastName}`,
      date,
      workOrders,
    };
  }

  /**
   * Get weekly schedule for a technician.
   */
  async getWeeklySchedule(
    companyId: string,
    technicianId: string,
    weekStart: string,
  ) {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${technicianId} not found`);
    }

    const start = new Date(`${weekStart}T00:00:00Z`);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        technicianId,
        scheduledStart: { gte: start, lt: end },
        status: { notIn: ['CANCELLED'] },
      },
      include: { customer: true },
      orderBy: { scheduledStart: 'asc' },
    });

    // Group by date
    const byDate: Record<string, any[]> = {};
    for (const wo of workOrders) {
      const dateKey = wo.scheduledStart.toISOString().split('T')[0];
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(wo);
    }

    return {
      technicianId,
      technicianName: `${technician.user.firstName} ${technician.user.lastName}`,
      weekStart,
      days: byDate,
    };
  }

  /**
   * Detect schedule conflicts for a technician on a given date.
   */
  async detectConflicts(
    companyId: string,
    technicianId: string,
    date: string,
  ): Promise<ScheduleConflict[]> {
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${technicianId} not found`);
    }

    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        technicianId,
        scheduledStart: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['CANCELLED', 'COMPLETED', 'INVOICED', 'PAID'] },
      },
      orderBy: { scheduledStart: 'asc' },
    });

    const conflicts: ScheduleConflict[] = [];

    // Check for overlapping work orders
    for (let i = 0; i < workOrders.length - 1; i++) {
      const current = workOrders[i];
      const next = workOrders[i + 1];

      if (current.scheduledEnd > next.scheduledStart) {
        conflicts.push({
          workOrderId: next.id,
          scheduledStart: next.scheduledStart,
          scheduledEnd: next.scheduledEnd,
          conflictType: 'overlap',
        });
      }
    }

    // Check against availability windows
    const schedule = (technician.schedule as any) ?? {};
    const availability: AvailabilityWindow[] = schedule.availability ?? [];
    const dayOfWeek = dayStart.getDay();
    const dayWindows = availability.filter((a) => a.dayOfWeek === dayOfWeek);

    if (dayWindows.length > 0) {
      for (const wo of workOrders) {
        const woStartTime = wo.scheduledStart.toISOString().split('T')[1].substring(0, 5);
        const woEndTime = wo.scheduledEnd.toISOString().split('T')[1].substring(0, 5);

        const isWithinAvailability = dayWindows.some(
          (w) => woStartTime >= w.startTime && woEndTime <= w.endTime,
        );

        if (!isWithinAvailability) {
          conflicts.push({
            workOrderId: wo.id,
            scheduledStart: wo.scheduledStart,
            scheduledEnd: wo.scheduledEnd,
            conflictType: 'outside_availability',
          });
        }
      }
    }

    return conflicts;
  }

  private isValidTime(time: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  }
}
