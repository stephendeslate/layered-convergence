import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { toJsonField, fromJsonField } from '../../common/helpers/json-field.helper';

interface Waypoint {
  workOrderId: string;
  lat: number;
  lng: number;
  customerName: string;
}

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async optimizeRoute(dto: OptimizeRouteDto) {
    const date = new Date(dto.date);

    // Get work orders for the technician on this date
    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        technicianId: dto.technicianId,
        scheduledAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      include: { customer: true },
    });

    const waypoints: Waypoint[] = workOrders.map((wo) => ({
      workOrderId: wo.id,
      lat: wo.customer.lat,
      lng: wo.customer.lng,
      customerName: wo.customer.name,
    }));

    // Simple nearest-neighbor optimization
    const optimizedOrder = this.nearestNeighborSort(waypoints);

    const route = await this.prisma.route.upsert({
      where: {
        technicianId_date: {
          technicianId: dto.technicianId,
          date: new Date(dto.date),
        },
      },
      update: {
        waypoints: toJsonField(waypoints),
        optimizedOrder,
        estimatedDuration: waypoints.length * 30, // 30 min per stop estimate
      },
      create: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: toJsonField(waypoints),
        optimizedOrder,
        estimatedDuration: waypoints.length * 30,
      },
    });

    return route;
  }

  async getRoute(technicianId: string, date: string) {
    const route = await this.prisma.route.findFirstOrThrow({
      where: {
        technicianId,
        date: new Date(date),
      },
      include: { technician: true },
    });

    return {
      ...route,
      waypoints: fromJsonField<Waypoint[]>(route.waypoints),
    };
  }

  private nearestNeighborSort(waypoints: Waypoint[]): number[] {
    if (waypoints.length <= 1) return waypoints.map((_, i) => i);

    const visited = new Set<number>();
    const order: number[] = [0];
    visited.add(0);

    while (order.length < waypoints.length) {
      const current = waypoints[order[order.length - 1]];
      let nearestIdx = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < waypoints.length; i++) {
        if (visited.has(i)) continue;
        const dist = this.haversineDistance(
          current.lat, current.lng,
          waypoints[i].lat, waypoints[i].lng,
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      if (nearestIdx >= 0) {
        visited.add(nearestIdx);
        order.push(nearestIdx);
      }
    }

    return order;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
