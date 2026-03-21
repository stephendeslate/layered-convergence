import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async optimizeRoute(dto: OptimizeRouteDto) {
    const technician = await this.prisma.technician.findUniqueOrThrow({
      where: { id: dto.technicianId },
    });

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        technicianId: dto.technicianId,
        status: { in: ['ASSIGNED', 'EN_ROUTE'] },
        scheduledAt: {
          gte: new Date(dto.date),
          lt: new Date(new Date(dto.date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: { customer: true },
    });

    // Build waypoints from work order customer locations
    const waypoints = workOrders.map((wo, index) => ({
      workOrderId: wo.id,
      lat: wo.customer.lat,
      lng: wo.customer.lng,
      address: wo.customer.address,
      originalIndex: index,
    }));

    // Simple nearest-neighbor optimization (in production: OpenRouteService Optimization API)
    const optimizedOrder = this.nearestNeighborOptimize(
      waypoints,
      technician.currentLat || 0,
      technician.currentLng || 0,
    );

    const route = await this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: waypoints,
        optimizedOrder,
        estimatedDuration: this.estimateDuration(waypoints, optimizedOrder),
      },
    });

    this.logger.log(
      `Route optimized for technician ${dto.technicianId}: ${waypoints.length} stops`,
    );

    return route;
  }

  async findByTechnician(technicianId: string, date?: string) {
    const where: Record<string, unknown> = { technicianId };
    if (date) {
      where.date = new Date(date);
    }

    return this.prisma.route.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.route.findUniqueOrThrow({
      where: { id },
      include: { technician: true },
    });
  }

  private nearestNeighborOptimize(
    waypoints: Array<{ lat: number; lng: number; originalIndex: number }>,
    startLat: number,
    startLng: number,
  ): number[] {
    if (waypoints.length === 0) return [];

    const visited = new Set<number>();
    const order: number[] = [];
    let currentLat = startLat;
    let currentLng = startLng;

    while (visited.size < waypoints.length) {
      let nearest = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < waypoints.length; i++) {
        if (visited.has(i)) continue;
        const dist = this.haversineDistance(
          currentLat, currentLng,
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
        currentLat = waypoints[nearest].lat;
        currentLng = waypoints[nearest].lng;
      }
    }

    return order;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private estimateDuration(
    waypoints: Array<{ lat: number; lng: number }>,
    order: number[],
  ): number {
    if (order.length < 2) return 30;

    let totalDistance = 0;
    for (let i = 0; i < order.length - 1; i++) {
      totalDistance += this.haversineDistance(
        waypoints[order[i]].lat, waypoints[order[i]].lng,
        waypoints[order[i + 1]].lat, waypoints[order[i + 1]].lng,
      );
    }

    // Assume 40 km/h average speed + 30 min per stop
    const driveTimeMinutes = (totalDistance / 40) * 60;
    const stopTimeMinutes = order.length * 30;
    return Math.round(driveTimeMinutes + stopTimeMinutes);
  }
}
