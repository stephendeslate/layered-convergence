import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ['ACTIVE'],
  ACTIVE: ['COMPLETED'],
  COMPLETED: [],
};

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including related technician;
    // findFirst allows future extension with company scoping in the where
    // clause for multi-tenant security filtering
    const route = await this.prisma.route.findFirst({
      where: { id },
      include: { technician: true },
    });

    if (!route) {
      throw new BadRequestException('Route not found');
    }

    return route;
  }

  async create(data: {
    name: string;
    date: Date;
    technicianId: string;
    companyId: string;
  }) {
    return this.prisma.route.create({
      data: {
        name: data.name,
        date: data.date,
        technicianId: data.technicianId,
        companyId: data.companyId,
      },
    });
  }

  async transitionStatus(id: string, newStatus: string) {
    // findFirst: fetching by primary key to validate current status for state
    // machine transition before performing the update; this two-step pattern
    // prevents invalid state transitions at the application layer
    const route = await this.prisma.route.findFirst({
      where: { id },
    });

    if (!route) {
      throw new BadRequestException('Route not found');
    }

    const allowed = VALID_TRANSITIONS[route.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${route.status} to ${newStatus}`,
      );
    }

    return this.prisma.route.update({
      where: { id },
      data: { status: newStatus as 'PLANNED' | 'ACTIVE' | 'COMPLETED' },
    });
  }
}
