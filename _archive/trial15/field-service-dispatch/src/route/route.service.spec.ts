import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { RouteService } from './route.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a route with waypoints', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2026-04-01',
        waypoints: [{ lat: 40.7128, lng: -74.006 }],
      };
      const expected = { id: 'route-1', ...dto };
      mockPrisma.route.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
    });

    it('should convert date string to Date object', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2026-04-01',
        waypoints: [{ lat: 40.7128, lng: -74.006 }],
      };
      mockPrisma.route.create.mockResolvedValue({ id: 'route-1' });

      await service.create(dto);
      expect(mockPrisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            date: new Date('2026-04-01'),
          }),
        }),
      );
    });

    it('should set optimizedOrder to empty array by default', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2026-04-01',
        waypoints: [{ lat: 40.7128, lng: -74.006 }],
      };
      mockPrisma.route.create.mockResolvedValue({ id: 'route-1' });

      await service.create(dto);
      expect(mockPrisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            optimizedOrder: [],
          }),
        }),
      );
    });

    it('should set estimatedDuration when provided', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2026-04-01',
        waypoints: [{ lat: 40.7128, lng: -74.006 }],
        estimatedDuration: 120,
      };
      mockPrisma.route.create.mockResolvedValue({ id: 'route-1' });

      await service.create(dto);
      expect(mockPrisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estimatedDuration: 120,
          }),
        }),
      );
    });
  });

  describe('findByTechnician', () => {
    it('should return routes for a technician ordered by date', async () => {
      const expected = [{ id: 'route-1' }, { id: 'route-2' }];
      mockPrisma.route.findMany.mockResolvedValue(expected);

      const result = await service.findByTechnician('tech-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
        where: { technicianId: 'tech-1' },
        orderBy: { date: 'asc' },
      });
    });

    it('should return empty array when no routes found', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);

      const result = await service.findByTechnician('tech-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single route by id', async () => {
      const expected = { id: 'route-1', technicianId: 'tech-1' };
      mockPrisma.route.findUniqueOrThrow.mockResolvedValue(expected);

      const result = await service.findOne('route-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.route.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'route-1' },
      });
    });
  });
});
