import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
      orderBy: { date: 'desc' },
      include: { technician: true, workOrders: true },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key with relations; consistent with
    // future company-scoped access control (id + companyId composite lookup)
    const route = await this.prisma.route.findFirst({
      where: { id },
      include: { technician: true, workOrders: true },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async transitionStatus(id: string, newStatus: string) {
    // findFirst: fetching by primary key to validate current status for state
    // machine transition logic before performing the update
    const route = await this.prisma.route.findFirst({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
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
