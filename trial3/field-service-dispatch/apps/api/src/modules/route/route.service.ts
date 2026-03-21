import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Waypoint {
  workOrderId: string;
  lat: number;
  lng: number;
  address: string;
}

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateRoute(technicianId: string, companyId: string, date: Date, waypoints: Waypoint[]) {
    // Verify technician belongs to company
    await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    if (waypoints.length === 0) {
      throw new BadRequestException('Route must have at least one waypoint');
    }

    // Optimize order using nearest-neighbor heuristic
    const optimizedOrder = this.nearestNeighborOptimize(waypoints);
    const estimatedDuration = this.estimateDuration(waypoints, optimizedOrder);

    const dateOnly = new Date(date.toISOString().split('T')[0]);

    return this.prisma.route.upsert({
      where: {
        technicianId_date: { technicianId, date: dateOnly },
      },
      create: {
        technicianId,
        date: dateOnly,
        waypoints: waypoints as never,
        optimizedOrder,
        estimatedDuration,
      },
      update: {
        waypoints: waypoints as never,
        optimizedOrder,
        estimatedDuration,
      },
    });
  }

  async getRoute(technicianId: string, companyId: string, date: Date) {
    await this.prisma.technician.findFirstOrThrow({
      where: { id: technicianId, companyId },
    });

    const dateOnly = new Date(date.toISOString().split('T')[0]);

    return this.prisma.route.findFirstOrThrow({
      where: { technicianId, date: dateOnly },
    });
  }

  async getRoutesForDate(companyId: string, date: Date) {
    const dateOnly = new Date(date.toISOString().split('T')[0]);
    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
      select: { id: true },
    });

    const techIds = technicians.map((t) => t.id);

    return this.prisma.route.findMany({
      where: {
        technicianId: { in: techIds },
        date: dateOnly,
      },
      include: {
        technician: { select: { id: true, name: true } },
      },
    });
  }

  private nearestNeighborOptimize(waypoints: Waypoint[]): number[] {
    if (waypoints.length <= 1) return [0];

    const visited = new Set<number>();
    const order: number[] = [];
    let current = 0;
    visited.add(0);
    order.push(0);

    while (visited.size < waypoints.length) {
      let nearest = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < waypoints.length; i++) {
        if (visited.has(i)) continue;
        const dist = this.haversineDistance(
          waypoints[current].lat, waypoints[current].lng,
          waypoints[i].lat, waypoints[i].lng,
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }

      if (nearest >= 0) {
        visited.add(nearest);
        order.push(nearest);
        current = nearest;
      }
    }

    return order;
  }

  private estimateDuration(waypoints: Waypoint[], order: number[]): number {
    let totalKm = 0;
    for (let i = 0; i < order.length - 1; i++) {
      totalKm += this.haversineDistance(
        waypoints[order[i]].lat, waypoints[order[i]].lng,
        waypoints[order[i + 1]].lat, waypoints[order[i + 1]].lng,
      );
    }
    // Assume average 40 km/h in urban areas + 15 min per stop
    const driveMinutes = (totalKm / 40) * 60;
    const stopMinutes = waypoints.length * 15;
    return Math.round(driveMinutes + stopMinutes);
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
