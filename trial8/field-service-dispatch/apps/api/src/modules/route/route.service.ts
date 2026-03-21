import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    this.logger.log(`Creating route for technician ${dto.technicianId} on ${dto.date}`);
    return this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: toJsonValue(dto.waypoints),
        optimizedOrder: toJsonValue(dto.waypoints.map((_, i) => i)),
      },
      include: { technician: true },
    });
  }

  async findByTechnician(technicianId: string, date?: string) {
    const where: Record<string, unknown> = { technicianId };
    if (date) where.date = new Date(date);

    return this.prisma.route.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { technician: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.route.findUniqueOrThrow({
      where: { id },
      include: { technician: true },
    });
  }

  async optimize(id: string) {
    const route = await this.prisma.route.findUniqueOrThrow({ where: { id } });
    const waypoints = route.waypoints as { lat: number; lng: number; workOrderId: string }[];

    // Simple nearest-neighbor optimization
    // In production, would call OpenRouteService Optimization API
    const optimized = this.nearestNeighborOptimize(waypoints);

    this.logger.log(`Optimized route ${id}: ${waypoints.length} stops`);

    return this.prisma.route.update({
      where: { id },
      data: {
        optimizedOrder: toJsonValue(optimized.order),
        estimatedDuration: optimized.estimatedMinutes,
        totalDistance: optimized.distanceKm,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.route.delete({ where: { id } });
  }

  private nearestNeighborOptimize(waypoints: { lat: number; lng: number }[]): {
    order: number[];
    estimatedMinutes: number;
    distanceKm: number;
  } {
    if (waypoints.length <= 1) {
      return { order: waypoints.map((_, i) => i), estimatedMinutes: 0, distanceKm: 0 };
    }

    const visited = new Set<number>();
    const order: number[] = [0];
    visited.add(0);
    let totalDistance = 0;

    while (order.length < waypoints.length) {
      const current = waypoints[order[order.length - 1]];
      let nearest = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < waypoints.length; i++) {
        if (visited.has(i)) continue;
        const dist = this.haversineDistance(
          current.lat, current.lng,
          waypoints[i].lat, waypoints[i].lng,
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }

      if (nearest >= 0) {
        order.push(nearest);
        visited.add(nearest);
        totalDistance += nearestDist;
      }
    }

    // Estimate 30 min per stop + travel time at 40 km/h average
    const travelMinutes = (totalDistance / 40) * 60;
    const serviceMinutes = waypoints.length * 30;

    return {
      order,
      estimatedMinutes: Math.round(travelMinutes + serviceMinutes),
      distanceKm: Math.round(totalDistance * 10) / 10,
    };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
