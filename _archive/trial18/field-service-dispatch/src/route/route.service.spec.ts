import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
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
    it('should create a route', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2024-01-15',
        waypoints: [
          { lat: 40.0, lng: -74.0, label: 'Stop A' },
          { lat: 40.1, lng: -74.1, label: 'Stop B' },
        ],
      };
      const expected = { id: 'route-1', ...dto };
      mockPrisma.route.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
    });

    it('should create a route with estimated duration', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2024-01-15',
        waypoints: [{ lat: 40.0, lng: -74.0 }],
        estimatedDuration: 120,
      };
      mockPrisma.route.create.mockResolvedValue({ id: 'route-2', ...dto });

      const result = await service.create(dto);
      expect(result.estimatedDuration).toBe(120);
    });
  });

  describe('findByTechnician', () => {
    it('should return routes for a technician', async () => {
      const expected = [{ id: 'route-1', technicianId: 'tech-1' }];
      mockPrisma.route.findMany.mockResolvedValue(expected);

      const result = await service.findByTechnician('tech-1');
      expect(result).toEqual(expected);
    });

    it('should return empty array when no routes', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);

      const result = await service.findByTechnician('no-routes');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      const expected = { id: 'route-1', waypoints: [] };
      mockPrisma.route.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('route-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);

      await expect(service.findOne('no')).rejects.toThrow(NotFoundException);
    });
  });

  describe('optimize', () => {
    it('should reverse waypoints as optimization stub', async () => {
      const waypoints = [
        { lat: 1, lng: 1, label: 'A' },
        { lat: 2, lng: 2, label: 'B' },
        { lat: 3, lng: 3, label: 'C' },
      ];
      const route = { id: 'route-1', waypoints };
      mockPrisma.route.findUnique.mockResolvedValue(route);
      const optimized = {
        ...route,
        optimizedOrder: [...waypoints].reverse(),
      };
      mockPrisma.route.update.mockResolvedValue(optimized);

      const result = await service.optimize('route-1');
      expect(result.optimizedOrder).toEqual([
        { lat: 3, lng: 3, label: 'C' },
        { lat: 2, lng: 2, label: 'B' },
        { lat: 1, lng: 1, label: 'A' },
      ]);
    });
  });
});
