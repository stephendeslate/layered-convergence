import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        companyId,
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints as unknown as Prisma.InputJsonValue,
        optimizedOrder: dto.optimizedOrder || [],
        estimatedDuration: dto.estimatedDuration,
      },
      include: { technician: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { technician: true },
    });
    if (!route) {
      throw new NotFoundException(`Route ${id} not found`);
    }
    return route;
  }

  async findByTechnician(companyId: string, technicianId: string) {
    return this.prisma.route.findMany({
      where: { companyId, technicianId },
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  }

  async delete(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.route.delete({ where: { id } });
  }
}
