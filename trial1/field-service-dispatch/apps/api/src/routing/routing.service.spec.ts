import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { RoutingService } from './routing.service';
import { RedisService } from '../redis/redis.service';
import type { Waypoint, OptimizationJob, OptimizationVehicle } from './routing.service';

describe('RoutingService', () => {
  let service: RoutingService;
  let redis: any;

  beforeEach(async () => {
    // Ensure mock mode (no API key)
    delete process.env.OPENROUTESERVICE_API_KEY;

    redis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      client: {
        duplicate: vi.fn().mockReturnValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutingService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<RoutingService>(RoutingService);
  });

  describe('getDirections (mock mode)', () => {
    it('should return mock directions between two points', async () => {
      const waypoints: Waypoint[] = [
        { latitude: 39.7392, longitude: -104.9903 },
        { latitude: 39.7500, longitude: -104.9800 },
      ];

      const result = await service.getDirections(waypoints);

      expect(result).toHaveProperty('distanceMeters');
      expect(result).toHaveProperty('durationSeconds');
      expect(result).toHaveProperty('geometry');
      expect(result).toHaveProperty('steps');
      expect(result.distanceMeters).toBeGreaterThan(0);
      expect(result.durationSeconds).toBeGreaterThan(0);
      expect(result.geometry.type).toBe('LineString');
      expect(result.geometry.coordinates).toHaveLength(2);
    });

    it('should return cached result on second call', async () => {
      const waypoints: Waypoint[] = [
        { latitude: 39.7392, longitude: -104.9903 },
        { latitude: 39.7500, longitude: -104.9800 },
      ];

      // First call: cache miss
      const result1 = await service.getDirections(waypoints);

      // Set up cache hit
      redis.get.mockResolvedValue(JSON.stringify(result1));

      const result2 = await service.getDirections(waypoints);

      expect(result2).toEqual(result1);
      expect(redis.set).toHaveBeenCalledTimes(1); // Only first call should set cache
    });

    it('should throw for less than 2 waypoints', async () => {
      await expect(
        service.getDirections([{ latitude: 39.7, longitude: -104.9 }]),
      ).rejects.toThrow('At least 2 waypoints required');
    });

    it('should handle multiple waypoints', async () => {
      const waypoints: Waypoint[] = [
        { latitude: 39.7392, longitude: -104.9903 },
        { latitude: 39.7500, longitude: -104.9800 },
        { latitude: 39.7600, longitude: -104.9700 },
      ];

      const result = await service.getDirections(waypoints);

      expect(result.geometry.coordinates).toHaveLength(3);
      expect(result.steps).toHaveLength(2);
    });
  });

  describe('optimizeRoute (mock mode)', () => {
    it('should optimize a route with jobs and a vehicle', async () => {
      const jobs: OptimizationJob[] = [
        { id: 'job-1', location: [-104.99, 39.74], service: 3600 },
        { id: 'job-2', location: [-104.98, 39.75], service: 1800 },
        { id: 'job-3', location: [-104.97, 39.76], service: 3600 },
      ];

      const vehicles: OptimizationVehicle[] = [
        { id: 'vehicle-1', start: [-104.9903, 39.7392] },
      ];

      const result = await service.optimizeRoute(jobs, vehicles);

      expect(result.routes).toHaveLength(1);
      expect(result.unassigned).toHaveLength(0);

      const route = result.routes[0];
      expect(route.vehicleId).toBe('vehicle-1');
      expect(route.steps).toHaveLength(4); // start + 3 jobs
      expect(route.steps[0].type).toBe('start');
      expect(route.steps[1].type).toBe('job');
      expect(route.steps[1].jobId).toBe('job-1');
      expect(route.distanceMeters).toBeGreaterThan(0);
      expect(route.durationSeconds).toBeGreaterThan(0);
    });

    it('should return empty routes for no jobs', async () => {
      const result = await service.optimizeRoute([], [
        { id: 'v-1', start: [-104.99, 39.74] },
      ]);

      expect(result.routes).toHaveLength(0);
      expect(result.unassigned).toHaveLength(0);
    });

    it('should mark all jobs as unassigned when no vehicles', async () => {
      const jobs: OptimizationJob[] = [
        { id: 'job-1', location: [-104.99, 39.74] },
      ];

      const result = await service.optimizeRoute(jobs, []);

      expect(result.routes).toHaveLength(0);
      expect(result.unassigned).toHaveLength(1);
      expect(result.unassigned[0].id).toBe('job-1');
    });

    it('should include return leg when vehicle has end location', async () => {
      const jobs: OptimizationJob[] = [
        { id: 'job-1', location: [-104.99, 39.74] },
      ];

      const vehicles: OptimizationVehicle[] = [
        {
          id: 'v-1',
          start: [-104.9903, 39.7392],
          end: [-104.9903, 39.7392],
        },
      ];

      const result = await service.optimizeRoute(jobs, vehicles);

      const route = result.routes[0];
      const lastStep = route.steps[route.steps.length - 1];
      expect(lastStep.type).toBe('end');
    });
  });
});
