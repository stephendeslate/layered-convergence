import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto, OptimizeRouteDto } from './route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    // Verify technician belongs to company
    await this.prisma.technician.findFirstOrThrow({
      where: { id: dto.technicianId, companyId },
    });

    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints ?? [],
        optimizedOrder: dto.optimizedOrder ?? [],
        estimatedDuration: dto.estimatedDuration,
      },
      include: { technician: true },
    });
  }

  async findByTechnician(companyId: string, technicianId: string, date?: string) {
    await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    const where: Record<string, unknown> = { technicianId };
    if (date) {
      where.date = new Date(date);
    }

    return this.prisma.route.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { technician: true },
    });
  }

  async findById(companyId: string, id: string) {
    const route = await this.prisma.route.findFirstOrThrow({
      where: { id },
      include: { technician: true },
    });

    if (route.technician.companyId !== companyId) {
      throw new Error('Route not found for this company');
    }

    return route;
  }

  /**
   * Optimize route ordering using a simple nearest-neighbor heuristic.
   * In production this would call OpenRouteService Optimization API.
   */
  async optimize(companyId: string, dto: OptimizeRouteDto) {
    await this.prisma.technician.findFirstOrThrow({
      where: { id: dto.technicianId, companyId },
    });

    const waypoints = dto.waypoints;
    if (waypoints.length <= 1) {
      return {
        optimizedOrder: waypoints.map((_, i) => i),
        estimatedDuration: 0,
        waypoints,
      };
    }

    // Simple nearest-neighbor optimization
    const visited = new Set<number>();
    const order: number[] = [0];
    visited.add(0);

    while (order.length < waypoints.length) {
      const current = waypoints[order[order.length - 1]];
      let nearestIdx = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < waypoints.length; i++) {
        if (visited.has(i)) continue;
        const dist = Math.sqrt(
          Math.pow(current.lat - waypoints[i].lat, 2) +
          Math.pow(current.lng - waypoints[i].lng, 2),
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      if (nearestIdx >= 0) {
        order.push(nearestIdx);
        visited.add(nearestIdx);
      }
    }

    // Rough estimate: 15 min per stop + travel time
    const estimatedDuration = waypoints.length * 15 + (waypoints.length - 1) * 10;

    return {
      optimizedOrder: order,
      estimatedDuration,
      waypoints: order.map((i) => waypoints[i]),
    };
  }
}
