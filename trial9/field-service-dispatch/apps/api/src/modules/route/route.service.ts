import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateRouteDto } from './route.dto';

interface Waypoint {
  workOrderId: string;
  lat: number;
  lng: number;
  address: string;
}

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    const route = await this.prisma.route.create({
      data: {
        technicianId: dto.technicianId,
        date: new Date(dto.date),
        waypoints: dto.waypoints ?? [],
      },
    });
    this.logger.log(`Route created: ${route.id} for technician ${dto.technicianId}`);
    return route;
  }

  async findByTechnicianAndDate(technicianId: string, date: string) {
    return this.prisma.route.findMany({
      where: {
        technicianId,
        date: new Date(date),
      },
    });
  }

  async findById(id: string) {
    return this.prisma.route.findUniqueOrThrow({
      where: { id },
      include: { technician: true },
    });
  }

  /**
   * Optimize a route using a nearest-neighbor heuristic.
   * In production, this would call OpenRouteService Optimization API (Vroom engine).
   * For CED trials, we implement a simple nearest-neighbor algorithm.
   */
  async optimize(technicianId: string, date: string) {
    // findFirst justified: querying by composite (technicianId, date) which is not a
    // unique constraint — multiple routes may exist per technician per day. We want
    // the first match or null, not an exception.
    const route = await this.prisma.route.findFirst({
      where: { technicianId, date: new Date(date) },
    });

    if (!route) {
      this.logger.warn(`No route found for technician ${technicianId} on ${date}`);
      return null;
    }

    const waypoints = route.waypoints as Waypoint[];
    if (waypoints.length <= 1) {
      return route;
    }

    // Nearest-neighbor optimization
    const optimized = this.nearestNeighborSort(waypoints);
    const estimatedDuration = this.estimateDuration(optimized);

    const updated = await this.prisma.route.update({
      where: { id: route.id },
      data: {
        optimizedOrder: optimized.map((wp) => wp.workOrderId),
        waypoints: optimized,
        estimatedDuration,
      },
    });

    this.logger.log(`Route ${route.id} optimized: ${waypoints.length} stops, ~${estimatedDuration} min`);
    return updated;
  }

  private nearestNeighborSort(waypoints: Waypoint[]): Waypoint[] {
    if (waypoints.length === 0) return [];

    const result: Waypoint[] = [waypoints[0]];
    const remaining = [...waypoints.slice(1)];

    while (remaining.length > 0) {
      const current = result[result.length - 1];
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = this.haversineDistance(
          current.lat, current.lng,
          remaining[i].lat, remaining[i].lng,
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      result.push(remaining[nearestIdx]);
      remaining.splice(nearestIdx, 1);
    }

    return result;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private estimateDuration(waypoints: Waypoint[]): number {
    // Estimate 15 min per stop + travel time at 30 km/h average
    let totalKm = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalKm += this.haversineDistance(
        waypoints[i - 1].lat, waypoints[i - 1].lng,
        waypoints[i].lat, waypoints[i].lng,
      );
    }
    const travelMinutes = (totalKm / 30) * 60;
    const serviceMinutes = waypoints.length * 15;
    return Math.round(travelMinutes + serviceMinutes);
  }

  async delete(id: string) {
    return this.prisma.route.delete({ where: { id } });
  }
}
