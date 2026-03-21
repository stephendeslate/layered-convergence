import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: filtering by both id AND companyId for tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { technician: true },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async create(dto: CreateRouteDto, companyId: string) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        distance: dto.distance,
        technicianId: dto.technicianId,
        companyId,
      },
      include: { technician: true },
    });
  }
}
