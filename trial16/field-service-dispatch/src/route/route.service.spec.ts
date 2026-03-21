import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: {
    route: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    technician: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const companyId = 'company-1';

  const mockRoute = {
    id: 'route-1',
    name: 'Morning Route',
    date: new Date('2026-03-21'),
    technicianId: 'tech-1',
    waypoints: [
      { latitude: 40.7128, longitude: -74.006, order: 1 },
      { latitude: 40.758, longitude: -73.9855, order: 2 },
    ],
    distance: 5.2,
    estimatedTime: 8,
    companyId,
    technician: { id: 'tech-1', name: 'John' },
  };

  beforeEach(() => {
    prisma = {
      route: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      technician: {
        findFirst: vi.fn(),
      },
    };
    service = new RouteService(prisma as unknown as PrismaService);
  });

  describe('haversineDistance', () => {
    it('should calculate distance between two points', () => {
      const distance = service.haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same point', () => {
      const distance = service.haversineDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(distance).toBe(0);
    });

    it('should calculate short distances correctly', () => {
      const distance = service.haversineDistance(40.7128, -74.006, 40.758, -73.9855);
      expect(distance).toBeGreaterThan(4);
      expect(distance).toBeLessThan(6);
    });
  });

  describe('calculateTotalDistance', () => {
    it('should calculate total distance of waypoints', () => {
      const waypoints = [
        { latitude: 40.7128, longitude: -74.006, order: 1 },
        { latitude: 40.758, longitude: -73.9855, order: 2 },
        { latitude: 40.7831, longitude: -73.9712, order: 3 },
      ];

      const distance = service.calculateTotalDistance(waypoints);
      expect(distance).toBeGreaterThan(0);
    });

    it('should return 0 for empty waypoints', () => {
      const distance = service.calculateTotalDistance([]);
      expect(distance).toBe(0);
    });

    it('should return 0 for single waypoint', () => {
      const distance = service.calculateTotalDistance([
        { latitude: 40.7128, longitude: -74.006, order: 1 },
      ]);
      expect(distance).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a route with calculated distance', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1', companyId });
      prisma.route.create.mockResolvedValue(mockRoute);

      const result = await service.create(companyId, {
        name: 'Morning Route',
        date: '2026-03-21',
        technicianId: 'tech-1',
        waypoints: [
          { latitude: 40.7128, longitude: -74.006, order: 1 },
          { latitude: 40.758, longitude: -73.9855, order: 2 },
        ],
      });

      expect(result.name).toBe('Morning Route');
    });

    it('should create route without technician', async () => {
      prisma.route.create.mockResolvedValue({ ...mockRoute, technicianId: null });

      const result = await service.create(companyId, {
        name: 'Unassigned Route',
        date: '2026-03-21',
      });

      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException for technician from other company', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.create(companyId, {
          name: 'Route',
          date: '2026-03-21',
          technicianId: 'tech-other',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all routes for company', async () => {
      prisma.route.findMany.mockResolvedValue([mockRoute]);

      const result = await service.findAll(companyId);

      expect(result).toHaveLength(1);
      expect(prisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId },
        }),
      );
    });

    it('should return empty array when no routes', async () => {
      prisma.route.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });

    it('should order by date descending', async () => {
      prisma.route.findMany.mockResolvedValue([]);

      await service.findAll(companyId);

      expect(prisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: 'desc' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a route', async () => {
      prisma.route.findFirst.mockResolvedValue(mockRoute);

      const result = await service.findById(companyId, 'route-1');
      expect(result).toEqual(mockRoute);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.findById(companyId, 'bad')).rejects.toThrow(NotFoundException);
    });

    it('should filter by companyId', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.findById('other', 'route-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update route fields', async () => {
      prisma.route.findFirst.mockResolvedValue(mockRoute);
      prisma.route.update.mockResolvedValue({ ...mockRoute, name: 'Afternoon Route' });

      const result = await service.update(companyId, 'route-1', { name: 'Afternoon Route' });
      expect(result.name).toBe('Afternoon Route');
    });

    it('should throw NotFoundException for non-existent route', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(
        service.update(companyId, 'bad', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a route', async () => {
      prisma.route.findFirst.mockResolvedValue(mockRoute);
      prisma.route.delete.mockResolvedValue(mockRoute);

      const result = await service.remove(companyId, 'route-1');
      expect(result).toEqual(mockRoute);
    });

    it('should throw NotFoundException for non-existent route', async () => {
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.remove(companyId, 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
