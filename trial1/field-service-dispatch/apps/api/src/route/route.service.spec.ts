import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoutingService } from '../routing/routing.service';
import { RedisService } from '../redis/redis.service';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: any;
  let routing: any;
  let redis: any;

  const COMPANY_ID = 'company-1';

  function makeRoute(overrides: Record<string, any> = {}) {
    return {
      id: 'route-1',
      companyId: COMPANY_ID,
      technicianId: 'tech-1',
      date: new Date('2026-03-20T00:00:00Z'),
      optimized: false,
      totalDistanceMeters: null,
      totalDurationSeconds: null,
      geometryJson: null,
      stops: [],
      technician: {
        id: 'tech-1',
        currentLatitude: 39.78,
        currentLongitude: -89.65,
        user: { firstName: 'John', lastName: 'Doe' },
      },
      ...overrides,
    };
  }

  function makeStop(overrides: Record<string, any> = {}) {
    return {
      id: 'stop-1',
      routeId: 'route-1',
      workOrderId: 'wo-1',
      sortOrder: 0,
      estimatedArrival: null,
      distanceFromPrevMeters: null,
      durationFromPrevSeconds: null,
      workOrder: {
        id: 'wo-1',
        latitude: 39.79,
        longitude: -89.66,
        estimatedMinutes: 60,
        customer: { id: 'cust-1', name: 'Test Customer' },
      },
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      route: {
        create: vi.fn().mockResolvedValue({ id: 'route-1' }),
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      routeStop: {
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({}),
      },
    };

    routing = {
      getDirections: vi.fn().mockResolvedValue({
        distanceMeters: 5000,
        durationSeconds: 600,
        steps: [],
        geometry: { type: 'LineString', coordinates: [] },
      }),
      optimizeRoute: vi.fn().mockResolvedValue({
        routes: [{
          distanceMeters: 12000,
          durationSeconds: 900,
          geometry: null,
          steps: [
            { type: 'start', jobId: null, arrival: null, distanceMeters: 0, duration: 0 },
            { type: 'job', jobId: 'wo-2', arrival: 1000, distanceMeters: 6000, duration: 450 },
            { type: 'job', jobId: 'wo-1', arrival: 2000, distanceMeters: 6000, duration: 450 },
            { type: 'end', jobId: null, arrival: null, distanceMeters: 0, duration: 0 },
          ],
        }],
        unassigned: [],
      }),
    };

    redis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
        { provide: RoutingService, useValue: routing },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  describe('create', () => {
    it('should create a route with stops', async () => {
      const fullRoute = makeRoute({
        stops: [makeStop()],
      });
      prisma.route.findFirst.mockResolvedValue(fullRoute);

      const result = await service.create(COMPANY_ID, 'tech-1', '2026-03-20', ['wo-1', 'wo-2']);

      expect(prisma.route.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: COMPANY_ID,
          technicianId: 'tech-1',
        }),
      });
      expect(prisma.routeStop.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimize', () => {
    it('should call ORS and reorder stops', async () => {
      const stop1 = makeStop({ id: 'stop-1', workOrderId: 'wo-1', sortOrder: 0 });
      const stop2 = makeStop({
        id: 'stop-2', workOrderId: 'wo-2', sortOrder: 1,
        workOrder: { id: 'wo-2', latitude: 39.80, longitude: -89.67, estimatedMinutes: 45 },
      });
      const route = makeRoute({ stops: [stop1, stop2] });

      prisma.route.findFirst
        .mockResolvedValueOnce(route) // first call in optimize
        .mockResolvedValueOnce({ ...route, optimized: true }); // second call in get

      const result = await service.optimize(COMPANY_ID, 'route-1');

      expect(routing.optimizeRoute).toHaveBeenCalled();
      expect(prisma.routeStop.deleteMany).toHaveBeenCalledWith({ where: { routeId: 'route-1' } });
      expect(prisma.routeStop.create).toHaveBeenCalledTimes(2);
      expect(prisma.route.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ optimized: true }),
        }),
      );
    });

    it('should skip optimization for routes with fewer than 2 stops', async () => {
      const route = makeRoute({ stops: [makeStop()] });
      prisma.route.findFirst.mockResolvedValue(route);

      await service.optimize(COMPANY_ID, 'route-1');

      expect(routing.optimizeRoute).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for missing route', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.optimize(COMPANY_ID, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDirections', () => {
    it('should build waypoints from technician through stops', async () => {
      const stop = makeStop();
      const route = makeRoute({ stops: [stop] });
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.getDirections(COMPANY_ID, 'route-1');

      expect(routing.getDirections).toHaveBeenCalledWith([
        { latitude: 39.78, longitude: -89.65 }, // tech position
        { latitude: 39.79, longitude: -89.66 }, // stop position
      ]);
      expect(result.distanceMeters).toBe(5000);
    });

    it('should return null for route with no stops', async () => {
      const route = makeRoute({ stops: [] });
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.getDirections(COMPANY_ID, 'route-1');

      expect(result.directions).toBeNull();
    });
  });

  describe('getEta', () => {
    it('should calculate ETA with traffic factor', async () => {
      const stop = makeStop();
      const route = makeRoute({ stops: [stop] });
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.getEta(COMPANY_ID, 'route-1', 0);

      expect(result.etaMinutes).toBeGreaterThan(0);
      expect(result.distanceMeters).toBe(5000);
      expect(result.trafficFactor).toBeDefined();
      // Should cache the result
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('eta:'),
        expect.any(String),
        60,
      );
    });

    it('should return cached ETA if available', async () => {
      const cachedEta = JSON.stringify({
        etaMinutes: 15,
        etaArrival: '2026-03-20T10:00:00Z',
        distanceMeters: 5000,
        distanceKm: '5.0',
        trafficFactor: 1.0,
      });
      redis.get.mockResolvedValue(cachedEta);

      const stop = makeStop();
      const route = makeRoute({ stops: [stop] });
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.getEta(COMPANY_ID, 'route-1', 0);

      expect(result.etaMinutes).toBe(15);
      expect(routing.getDirections).not.toHaveBeenCalled();
    });

    it('should return null ETA when technician has no GPS position', async () => {
      const route = makeRoute({
        stops: [makeStop()],
        technician: {
          id: 'tech-1',
          currentLatitude: null,
          currentLongitude: null,
          user: { firstName: 'John', lastName: 'Doe' },
        },
      });
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.getEta(COMPANY_ID, 'route-1', 0);

      expect(result.etaMinutes).toBeNull();
      expect(result.message).toContain('GPS');
    });

    it('should throw for invalid stop index', async () => {
      const route = makeRoute({ stops: [makeStop()] });
      prisma.route.findFirst.mockResolvedValue(route);

      await expect(service.getEta(COMPANY_ID, 'route-1', 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('get', () => {
    it('should return route with stops', async () => {
      const route = makeRoute({ stops: [makeStop()] });
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.get(COMPANY_ID, 'route-1');

      expect(result.id).toBe('route-1');
      expect(result.stops).toHaveLength(1);
    });

    it('should throw NotFoundException for missing route', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.get(COMPANY_ID, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByTechnicianAndDate', () => {
    it('should return route for technician on date', async () => {
      const route = makeRoute();
      prisma.route.findFirst.mockResolvedValue(route);

      const result = await service.getByTechnicianAndDate(COMPANY_ID, 'tech-1', '2026-03-20');

      expect(result.technicianId).toBe('tech-1');
    });

    it('should throw if no route found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(
        service.getByTechnicianAndDate(COMPANY_ID, 'tech-1', '2026-03-20'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
