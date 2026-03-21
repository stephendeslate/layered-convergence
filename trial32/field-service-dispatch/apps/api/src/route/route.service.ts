// [TRACED:FD-AC-005] Route CRUD with company isolation
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; date: Date; technicianId: string; companyId: string }) {
    return this.prisma.route.create({ data });
  }

  async findAll(companyId: string) {
    return this.prisma.route.findMany({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: querying by id + companyId for company isolation
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.route.delete({ where: { id } });
  }
}
