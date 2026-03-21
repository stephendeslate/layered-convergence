import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async getTechnicianSchedule(companyId: string, technicianId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        technicianId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { customer: true },
      orderBy: { scheduledAt: 'asc' },
    });

    const route = await this.prisma.route.findFirst({
      where: {
        technicianId,
        date: startOfDay,
      },
    });

    return {
      technicianId,
      date,
      workOrders,
      route,
      totalJobs: workOrders.length,
    };
  }

  async getDailySchedule(companyId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
      include: {
        workOrders: {
          where: {
            scheduledAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: { customer: true },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    return technicians.map((tech) => ({
      technicianId: tech.id,
      name: tech.name,
      status: tech.status,
      jobs: tech.workOrders,
      totalJobs: tech.workOrders.length,
    }));
  }
}
