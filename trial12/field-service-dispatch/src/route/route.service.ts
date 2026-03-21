import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRouteDto } from './dto/create-route.dto.js';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints as any,
        estimatedDuration: dto.estimatedDuration,
      },
    });
  }

  findByTechnician(technicianId: string) {
    return this.prisma.route.findMany({
      where: { technicianId },
      orderBy: { date: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.route.findUniqueOrThrow({ where: { id } });
  }

  optimize(id: string) {
    return this.prisma.route.update({
      where: { id },
      data: {
        optimizedOrder: { stub: true, message: 'Optimization not yet implemented' } as any,
      },
    });
  }
}
