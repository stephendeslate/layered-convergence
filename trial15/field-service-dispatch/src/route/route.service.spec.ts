import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  technician: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  workOrder: {
    findFirst: vi.fn(),
  },
};

const COMPANY_ID = 'company-1';

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

  describe('haversineDistance', () => {
    it('should calculate distance between two points', () => {
      // New York to Los Angeles approximately 3944 km
      const dist = service.haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
      expect(dist).toBeGreaterThan(3900);
      expect(dist).toBeLessThan(4000);
    });

    it('should return 0 for same point', () => {
      const dist = service.haversineDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(dist).toBe(0);
    });

    it('should calculate short distances accurately', () => {
      // Times Square to Empire State Building ~1.1 km
      const dist = service.haversineDistance(40.758, -73.9855, 40.7484, -73.9856);
      expect(dist).toBeGreaterThan(1.0);
      expect(dist).toBeLessThan(1.2);
    });

    it('should handle negative coordinates', () => {
      // Sydney to Auckland
      const dist = service.haversineDistance(-33.8688, 151.2093, -36.8485, 174.7633);
      expect(dist).toBeGreaterThan(2100);
      expect(dist).toBeLessThan(2200);
    });

    it('should handle equator crossing', () => {
      const dist = service.haversineDistance(1.0, 0.0, -1.0, 0.0);
      expect(dist).toBeGreaterThan(220);
      expect(dist).toBeLessThan(225);
    });

    it('should be symmetric', () => {
      const dist1 = service.haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
      const dist2 = service.haversineDistance(34.0522, -118.2437, 40.7128, -74.006);
      expect(Math.abs(dist1 - dist2)).toBeLessThan(0.001);
    });
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = {
        name: 'Morning Route',
        waypoints: [
          { lat: 40.7, lng: -74.0 },
          { lat: 40.8, lng: -73.9 },
        ],
        technicianId: 'tech-1',
      };
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.route.create.mockResolvedValue({ id: 'route-1', ...dto });

      const result = await service.create(COMPANY_ID, dto);
      expect(result.id).toBe('route-1');
    });

    it('should throw NotFoundException when technician not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.create(COMPANY_ID, {
          waypoints: [{ lat: 0, lng: 0 }],
          technicianId: 'bad',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate total distance from waypoints', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.route.create.mockResolvedValue({ id: 'route-1' });

      await service.create(COMPANY_ID, {
        waypoints: [
          { lat: 40.7, lng: -74.0 },
          { lat: 40.8, lng: -73.9 },
        ],
        technicianId: 'tech-1',
      });

      expect(mockPrisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            distance: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all routes for company', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: 'route-1' }]);
      const result = await service.findAll(COMPANY_ID);
      expect(result).toHaveLength(1);
    });

    it('should scope by companyId', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);
      await service.findAll(COMPANY_ID);
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId: COMPANY_ID } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'route-1' });
      const result = await service.findOne('route-1', COMPANY_ID);
      expect(result.id).toBe('route-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'route-1' });
      mockPrisma.route.update.mockResolvedValue({ id: 'route-1', name: 'Updated' });

      const result = await service.update('route-1', COMPANY_ID, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should recalculate distance when waypoints updated', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'route-1' });
      mockPrisma.route.update.mockResolvedValue({ id: 'route-1' });

      await service.update('route-1', COMPANY_ID, {
        waypoints: [
          { lat: 40.7, lng: -74.0 },
          { lat: 41.0, lng: -73.5 },
        ],
      });

      expect(mockPrisma.route.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            distance: expect.any(Number),
          }),
        }),
      );
    });

    it('should throw NotFoundException when route not found', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.update('bad', COMPANY_ID, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'route-1' });
      mockPrisma.route.delete.mockResolvedValue({ id: 'route-1' });

      const result = await service.remove('route-1', COMPANY_ID);
      expect(result.id).toBe('route-1');
    });

    it('should throw NotFoundException when route not found', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('autoAssignNearest', () => {
    it('should find nearest available technician', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        customer: { lat: 40.75, lng: -73.99 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-far', lat: 41.0, lng: -74.5, availability: 'AVAILABLE' },
        { id: 'tech-near', lat: 40.76, lng: -73.98, availability: 'AVAILABLE' },
      ]);

      const result = await service.autoAssignNearest('wo-1', COMPANY_ID);
      expect(result.technician.id).toBe('tech-near');
      expect(result.distance).toBeGreaterThan(0);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(service.autoAssignNearest('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when no available technicians', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        customer: { lat: 40.75, lng: -73.99 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([]);

      await expect(service.autoAssignNearest('wo-1', COMPANY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when work order has no customer', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        customer: null,
      });

      await expect(service.autoAssignNearest('wo-1', COMPANY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should return distance to nearest technician', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        customer: { lat: 40.75, lng: -73.99 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', lat: 40.76, lng: -73.98, availability: 'AVAILABLE' },
      ]);

      const result = await service.autoAssignNearest('wo-1', COMPANY_ID);
      expect(result.distance).toBeGreaterThan(0);
      expect(result.workOrderId).toBe('wo-1');
    });

    it('should select the closest technician among multiple', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        customer: { lat: 0, lng: 0 },
      });
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', lat: 10, lng: 10, availability: 'AVAILABLE' },
        { id: 'tech-2', lat: 1, lng: 1, availability: 'AVAILABLE' },
        { id: 'tech-3', lat: 5, lng: 5, availability: 'AVAILABLE' },
      ]);

      const result = await service.autoAssignNearest('wo-1', COMPANY_ID);
      expect(result.technician.id).toBe('tech-2');
    });
  });
});
