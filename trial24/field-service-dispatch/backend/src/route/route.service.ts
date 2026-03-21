// [TRACED:DM-010] Route state machine: PLANNED->IN_PROGRESS->COMPLETED

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RouteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const VALID_ROUTE_TRANSITIONS: Record<string, RouteStatus[]> = {
  PLANNED: [RouteStatus.IN_PROGRESS],
  IN_PROGRESS: [RouteStatus.COMPLETED],
  COMPLETED: [],
};

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: fetching by primary key + company scope for multi-tenant RLS verification
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { technician: true },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async create(data: {
    name: string;
    date: Date;
    estimatedDistance: number;
    technicianId: string;
    companyId: string;
  }) {
    return this.prisma.route.create({
      data: {
        name: data.name,
        date: data.date,
        estimatedDistance: data.estimatedDistance,
        technicianId: data.technicianId,
        companyId: data.companyId,
        status: RouteStatus.PLANNED,
      },
    });
  }

  async update(
    id: string,
    companyId: string,
    data: { name?: string; date?: Date; estimatedDistance?: number },
  ) {
    await this.findOne(id, companyId);
    return this.prisma.route.update({
      where: { id },
      data,
    });
  }

  async transition(id: string, companyId: string, newStatus: RouteStatus) {
    const route = await this.findOne(id, companyId);
    const currentStatus = route.status;
    const allowed = VALID_ROUTE_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new ConflictException(
        `Cannot transition route from ${currentStatus} to ${newStatus}`,
      );
    }

    return this.prisma.route.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.route.delete({
      where: { id },
    });
  }
}
