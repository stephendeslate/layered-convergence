import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoutingService } from '../routing/routing.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly routing: RoutingService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Create a route for a technician on a specific date.
   */
  async create(
    companyId: string,
    technicianId: string,
    date: string,
    workOrderIds: string[],
  ) {
    const dateObj = new Date(`${date}T00:00:00Z`);

    const route = await this.prisma.route.create({
      data: {
        companyId,
        technicianId,
        date: dateObj,
      },
    });

    // Create route stops
    for (let i = 0; i < workOrderIds.length; i++) {
      await this.prisma.routeStop.create({
        data: {
          companyId,
          routeId: route.id,
          workOrderId: workOrderIds[i],
          sortOrder: i,
        },
      });
    }

    return this.get(companyId, route.id);
  }

  /**
   * Optimize a route using OpenRouteService.
   */
  async optimize(companyId: string, routeId: string) {
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, companyId },
      include: {
        stops: {
          include: { workOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        technician: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route ${routeId} not found`);
    }

    if (route.stops.length < 2) {
      return this.get(companyId, routeId);
    }

    const jobs = route.stops.map((stop) => ({
      id: stop.workOrderId,
      location: [
        Number(stop.workOrder.longitude),
        Number(stop.workOrder.latitude),
      ] as [number, number],
      service: stop.workOrder.estimatedMinutes * 60,
    }));

    const startLocation: [number, number] =
      route.technician.currentLatitude && route.technician.currentLongitude
        ? [Number(route.technician.currentLongitude), Number(route.technician.currentLatitude)]
        : jobs[0].location;

    const vehicles = [{
      id: route.technicianId,
      start: startLocation,
      end: startLocation,
    }];

    const result = await this.routing.optimizeRoute(jobs, vehicles);

    if (result.routes.length > 0) {
      const optimized = result.routes[0];

      await this.prisma.route.update({
        where: { id: routeId },
        data: {
          optimized: true,
          totalDistanceMeters: optimized.distanceMeters,
          totalDurationSeconds: optimized.durationSeconds,
          geometryJson: optimized.geometry
            ? JSON.stringify(optimized.geometry)
            : null,
        },
      });

      // Re-order stops
      await this.prisma.routeStop.deleteMany({
        where: { routeId },
      });

      const jobSteps = optimized.steps.filter((s) => s.type === 'job');
      for (let i = 0; i < jobSteps.length; i++) {
        const step = jobSteps[i];
        await this.prisma.routeStop.create({
          data: {
            companyId,
            routeId,
            workOrderId: step.jobId!,
            sortOrder: i,
            estimatedArrival: step.arrival
              ? new Date(step.arrival * 1000)
              : null,
            distanceFromPrevMeters: step.distanceMeters,
            durationFromPrevSeconds: step.duration,
          },
        });
      }
    }

    return this.get(companyId, routeId);
  }

  /**
   * Get turn-by-turn directions for a route.
   */
  async getDirections(companyId: string, routeId: string) {
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, companyId },
      include: {
        stops: {
          include: { workOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        technician: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route ${routeId} not found`);
    }

    if (route.stops.length === 0) {
      return { directions: null, geometry: null };
    }

    // Build waypoints: technician position -> stops in order
    const waypoints: Array<{ latitude: number; longitude: number }> = [];

    if (route.technician.currentLatitude && route.technician.currentLongitude) {
      waypoints.push({
        latitude: Number(route.technician.currentLatitude),
        longitude: Number(route.technician.currentLongitude),
      });
    }

    for (const stop of route.stops) {
      waypoints.push({
        latitude: Number(stop.workOrder.latitude),
        longitude: Number(stop.workOrder.longitude),
      });
    }

    if (waypoints.length < 2) {
      return { directions: null, geometry: null };
    }

    const result = await this.routing.getDirections(waypoints);

    return {
      directions: result.steps,
      geometry: result.geometry,
      distanceMeters: result.distanceMeters,
      durationSeconds: result.durationSeconds,
    };
  }

  /**
   * Get ETA to a specific stop in the route.
   */
  async getEta(companyId: string, routeId: string, stopIndex: number) {
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, companyId },
      include: {
        stops: {
          include: { workOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        technician: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route ${routeId} not found`);
    }

    const stop = route.stops[stopIndex];
    if (!stop) {
      throw new NotFoundException(`Stop index ${stopIndex} not found`);
    }

    if (!route.technician.currentLatitude || !route.technician.currentLongitude) {
      return {
        etaMinutes: null,
        etaArrival: null,
        distanceMeters: null,
        message: 'Technician GPS position not available',
      };
    }

    // Check Redis cache
    const cacheKey = `eta:${route.technicianId}:${stop.workOrderId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate directions from technician to stop
    const result = await this.routing.getDirections([
      {
        latitude: Number(route.technician.currentLatitude),
        longitude: Number(route.technician.currentLongitude),
      },
      {
        latitude: Number(stop.workOrder.latitude),
        longitude: Number(stop.workOrder.longitude),
      },
    ]);

    // Apply traffic factor
    const hour = new Date().getUTCHours();
    let trafficFactor = 1.0;
    if (hour >= 7 && hour < 9) trafficFactor = 1.3;
    else if (hour >= 16 && hour < 18.5) trafficFactor = 1.35;
    else if (hour >= 18.5 || hour < 7) trafficFactor = 0.9;

    const etaSeconds = result.durationSeconds * trafficFactor;
    const etaMinutes = Math.ceil(etaSeconds / 60);
    const etaArrival = new Date(Date.now() + etaSeconds * 1000).toISOString();

    const eta = {
      etaMinutes,
      etaArrival,
      distanceMeters: result.distanceMeters,
      distanceKm: (result.distanceMeters / 1000).toFixed(1),
      trafficFactor,
    };

    // Cache for 60 seconds
    await this.redis.set(cacheKey, JSON.stringify(eta), 60);

    return eta;
  }

  /**
   * Get a route with all stops.
   */
  async get(companyId: string, routeId: string) {
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, companyId },
      include: {
        stops: {
          include: { workOrder: { include: { customer: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        technician: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route ${routeId} not found`);
    }

    return route;
  }

  /**
   * Get a route for a technician on a specific date.
   */
  async getByTechnicianAndDate(
    companyId: string,
    technicianId: string,
    date: string,
  ) {
    const dateObj = new Date(`${date}T00:00:00Z`);

    const route = await this.prisma.route.findFirst({
      where: {
        companyId,
        technicianId,
        date: dateObj,
      },
      include: {
        stops: {
          include: { workOrder: { include: { customer: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        technician: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(
        `No route found for technician ${technicianId} on ${date}`,
      );
    }

    return route;
  }
}
