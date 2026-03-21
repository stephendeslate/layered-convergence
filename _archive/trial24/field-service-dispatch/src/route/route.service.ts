import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRouteDto } from './dto/create-route.dto.js';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints,
        estimatedDuration: dto.estimatedDuration,
      },
    });
  }

  async findByTechnician(technicianId: string) {
    return this.prisma.route.findMany({
      where: { technicianId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) {
      throw new NotFoundException(`Route ${id} not found`);
    }
    return route;
  }

  async optimize(id: string) {
    const route = await this.findOne(id);
    const waypoints = route.waypoints as Array<{
      lat: number;
      lng: number;
      label?: string;
    }>;
    const optimizedOrder = [...waypoints].reverse();

    return this.prisma.route.update({
      where: { id },
      data: { optimizedOrder },
    });
  }
}
