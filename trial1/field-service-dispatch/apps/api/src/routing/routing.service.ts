import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface Waypoint {
  latitude: number;
  longitude: number;
}

export interface DirectionsResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry: any; // GeoJSON
  steps: Array<{
    distanceMeters: number;
    durationSeconds: number;
    instruction: string;
  }>;
}

export interface OptimizationJob {
  id: string;
  location: [number, number]; // [longitude, latitude]
  service?: number; // service time in seconds
}

export interface OptimizationVehicle {
  id: string;
  start: [number, number]; // [longitude, latitude]
  end?: [number, number];
}

export interface OptimizationResult {
  routes: Array<{
    vehicleId: string;
    steps: Array<{
      type: 'start' | 'job' | 'end';
      jobId?: string;
      arrival: number;
      duration: number;
      distanceMeters: number;
      location: [number, number];
    }>;
    distanceMeters: number;
    durationSeconds: number;
    geometry?: any;
  }>;
  unassigned: Array<{ id: string; reason: string }>;
}

const ROUTE_CACHE_TTL_SECONDS = 3600; // 1 hour
const ORS_BASE_URL = 'https://api.openrouteservice.org';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly apiKey: string | undefined;
  private readonly useMock: boolean;

  constructor(private readonly redis: RedisService) {
    this.apiKey = process.env.OPENROUTESERVICE_API_KEY;
    this.useMock = !this.apiKey;

    if (this.useMock) {
      this.logger.warn(
        'OpenRouteService API key not set. Using mock routing data.',
      );
    } else {
      this.logger.log('OpenRouteService initialized with real API');
    }
  }

  /**
   * Get driving directions between waypoints.
   */
  async getDirections(waypoints: Waypoint[]): Promise<DirectionsResult> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints required');
    }

    const cacheKey = this.directionsCacheKey(waypoints);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = this.useMock
      ? this.mockDirections(waypoints)
      : await this.realDirections(waypoints);

    await this.redis.set(cacheKey, JSON.stringify(result), ROUTE_CACHE_TTL_SECONDS);
    return result;
  }

  /**
   * Optimize route for a set of jobs and vehicles using Vroom engine.
   */
  async optimizeRoute(
    jobs: OptimizationJob[],
    vehicles: OptimizationVehicle[],
  ): Promise<OptimizationResult> {
    if (jobs.length === 0) {
      return { routes: [], unassigned: [] };
    }

    const result = this.useMock
      ? this.mockOptimize(jobs, vehicles)
      : await this.realOptimize(jobs, vehicles);

    return result;
  }

  // ============================================================
  // Real API calls
  // ============================================================

  private async realDirections(waypoints: Waypoint[]): Promise<DirectionsResult> {
    const coordinates = waypoints.map((w) => [w.longitude, w.latitude]);

    const response = await fetch(
      `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.apiKey!,
        },
        body: JSON.stringify({
          coordinates,
          instructions: true,
          geometry: true,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`ORS directions error: ${response.status} ${body}`);
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const data: any = await response.json();
    const feature = data.features?.[0];
    const summary = feature?.properties?.summary;
    const segments = feature?.properties?.segments ?? [];

    const steps = segments.flatMap((seg: any) =>
      (seg.steps ?? []).map((step: any) => ({
        distanceMeters: Math.round(step.distance),
        durationSeconds: Math.round(step.duration),
        instruction: step.instruction ?? '',
      })),
    );

    return {
      distanceMeters: Math.round(summary?.distance ?? 0),
      durationSeconds: Math.round(summary?.duration ?? 0),
      geometry: feature?.geometry,
      steps,
    };
  }

  private async realOptimize(
    jobs: OptimizationJob[],
    vehicles: OptimizationVehicle[],
  ): Promise<OptimizationResult> {
    const body = {
      jobs: jobs.map((j) => ({
        id: parseInt(j.id, 10) || jobs.indexOf(j) + 1,
        description: j.id,
        location: j.location,
        service: j.service ?? 3600, // default 1 hour
      })),
      vehicles: vehicles.map((v, i) => ({
        id: i + 1,
        description: v.id,
        start: v.start,
        end: v.end,
        profile: 'driving-car',
      })),
    };

    const response = await fetch(`${ORS_BASE_URL}/optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey!,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      this.logger.error(`ORS optimization error: ${response.status} ${responseBody}`);
      throw new Error(`OpenRouteService optimization API error: ${response.status}`);
    }

    const data: any = await response.json();

    return {
      routes: (data.routes ?? []).map((route: any) => ({
        vehicleId:
          vehicles[route.vehicle - 1]?.id ?? String(route.vehicle),
        steps: (route.steps ?? []).map((step: any) => ({
          type: step.type,
          jobId: step.description,
          arrival: step.arrival,
          duration: step.duration,
          distanceMeters: Math.round(step.distance ?? 0),
          location: step.location,
        })),
        distanceMeters: Math.round(route.distance ?? 0),
        durationSeconds: Math.round(route.duration ?? 0),
        geometry: route.geometry,
      })),
      unassigned: (data.unassigned ?? []).map((u: any) => ({
        id: u.description ?? String(u.id),
        reason: u.reason ?? 'unknown',
      })),
    };
  }

  // ============================================================
  // Mock implementations
  // ============================================================

  private mockDirections(waypoints: Waypoint[]): DirectionsResult {
    // Calculate approximate distance using haversine
    let totalDistance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalDistance += this.haversineDistance(
        waypoints[i - 1].latitude,
        waypoints[i - 1].longitude,
        waypoints[i].latitude,
        waypoints[i].longitude,
      );
    }

    // Assume average 40 km/h in urban areas
    const durationSeconds = Math.round((totalDistance / 40000) * 3600);

    // Generate a simple LineString geometry
    const coordinates = waypoints.map((w) => [w.longitude, w.latitude]);

    return {
      distanceMeters: Math.round(totalDistance),
      durationSeconds,
      geometry: {
        type: 'LineString',
        coordinates,
      },
      steps: waypoints.slice(1).map((w, i) => {
        const dist = this.haversineDistance(
          waypoints[i].latitude,
          waypoints[i].longitude,
          w.latitude,
          w.longitude,
        );
        return {
          distanceMeters: Math.round(dist),
          durationSeconds: Math.round((dist / 40000) * 3600),
          instruction: `Continue to waypoint ${i + 2}`,
        };
      }),
    };
  }

  private mockOptimize(
    jobs: OptimizationJob[],
    vehicles: OptimizationVehicle[],
  ): OptimizationResult {
    // Simple mock: assign all jobs to the first vehicle in order
    if (vehicles.length === 0) {
      return {
        routes: [],
        unassigned: jobs.map((j) => ({ id: j.id, reason: 'No vehicles available' })),
      };
    }

    const vehicle = vehicles[0];
    let currentTime = 0;
    let totalDistance = 0;
    let prevLocation = vehicle.start;

    const steps: OptimizationResult['routes'][0]['steps'] = [
      {
        type: 'start',
        arrival: 0,
        duration: 0,
        distanceMeters: 0,
        location: vehicle.start,
      },
    ];

    for (const job of jobs) {
      const dist = this.haversineDistance(
        prevLocation[1],
        prevLocation[0],
        job.location[1],
        job.location[0],
      );
      const travelTime = Math.round((dist / 40000) * 3600);
      currentTime += travelTime;
      totalDistance += dist;

      steps.push({
        type: 'job',
        jobId: job.id,
        arrival: currentTime,
        duration: job.service ?? 3600,
        distanceMeters: Math.round(dist),
        location: job.location,
      });

      currentTime += job.service ?? 3600;
      prevLocation = job.location;
    }

    if (vehicle.end) {
      const dist = this.haversineDistance(
        prevLocation[1],
        prevLocation[0],
        vehicle.end[1],
        vehicle.end[0],
      );
      totalDistance += dist;
      currentTime += Math.round((dist / 40000) * 3600);
      steps.push({
        type: 'end',
        arrival: currentTime,
        duration: 0,
        distanceMeters: Math.round(dist),
        location: vehicle.end,
      });
    }

    return {
      routes: [
        {
          vehicleId: vehicle.id,
          steps,
          distanceMeters: Math.round(totalDistance),
          durationSeconds: currentTime,
        },
      ],
      unassigned: [],
    };
  }

  // ============================================================
  // Utilities
  // ============================================================

  private directionsCacheKey(waypoints: Waypoint[]): string {
    const coords = waypoints
      .map((w) => `${w.latitude.toFixed(5)},${w.longitude.toFixed(5)}`)
      .join('|');
    return `route:directions:${coords}`;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
