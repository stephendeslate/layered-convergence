import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    // findFirst justified: fetching by primary key + company scope for RLS verification
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
    return this.prisma.route.create({ data });
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

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.route.delete({
      where: { id },
    });
  }
}
