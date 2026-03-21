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
        date: '2024-06-15',
        waypoints: [{ lat: 40.0, lng: -74.0, label: 'Stop 1' }],
      };
      const expected = { id: 'route-1', ...dto };
      mockPrisma.route.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
    });

    it('should create a route with estimatedDuration', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2024-06-15',
        waypoints: [{ lat: 40.0, lng: -74.0 }],
        estimatedDuration: 120,
      };
      const expected = { id: 'route-1', ...dto };
      mockPrisma.route.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.route.create).toHaveBeenCalledWith({
        data: {
          technicianId: 'tech-1',
          date: expect.any(Date),
          waypoints: dto.waypoints,
          estimatedDuration: 120,
        },
      });
    });
  });

  describe('findByTechnician', () => {
    it('should return routes for a technician', async () => {
      const expected = [{ id: 'route-1', technicianId: 'tech-1' }];
      mockPrisma.route.findMany.mockResolvedValue(expected);

      const result = await service.findByTechnician('tech-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
        where: { technicianId: 'tech-1' },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      const expected = { id: 'route-1', technicianId: 'tech-1' };
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
    it('should reverse waypoints as optimized order', async () => {
      const route = {
        id: 'route-1',
        waypoints: [
          { lat: 40.0, lng: -74.0, label: 'A' },
          { lat: 41.0, lng: -75.0, label: 'B' },
          { lat: 42.0, lng: -76.0, label: 'C' },
        ],
      };
      mockPrisma.route.findUnique.mockResolvedValue(route);
      const updated = {
        ...route,
        optimizedOrder: [...route.waypoints].reverse(),
      };
      mockPrisma.route.update.mockResolvedValue(updated);

      const result = await service.optimize('route-1');
      expect(result.optimizedOrder).toEqual([
        { lat: 42.0, lng: -76.0, label: 'C' },
        { lat: 41.0, lng: -75.0, label: 'B' },
        { lat: 40.0, lng: -74.0, label: 'A' },
      ]);
    });

    it('should throw NotFoundException if route does not exist', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);

      await expect(service.optimize('no')).rejects.toThrow(NotFoundException);
    });
  });
});
