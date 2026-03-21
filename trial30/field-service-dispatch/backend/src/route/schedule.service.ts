import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTechnician(technicianId: string) {
    return this.prisma.schedule.findMany({
      where: { technicianId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      orderBy: { dayOfWeek: 'asc' },
      include: { technician: true },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but findFirst allows future
    // composite filtering (e.g., id + technicianId for ownership check)
    const schedule = await this.prisma.schedule.findFirst({
      where: { id },
      include: { technician: true },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async create(data: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    technicianId: string;
  }) {
    return this.prisma.schedule.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        technicianId: data.technicianId,
      },
    });
  }

  async delete(id: string) {
    // findFirst: verifying existence before delete; findFirst supports
    // future multi-field ownership checks (e.g., id + technicianId)
    const schedule = await this.prisma.schedule.findFirst({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.schedule.delete({ where: { id } });
  }
}
