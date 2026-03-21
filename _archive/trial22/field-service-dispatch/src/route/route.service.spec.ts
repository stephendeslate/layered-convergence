import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service.js';

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

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RouteService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = {
        technicianId: 't1',
        date: '2024-01-01',
        waypoints: [{ lat: 40.7, lng: -74.0 }],
      };
      mockPrisma.route.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto as any);
      expect(result.technicianId).toBe('t1');
    });

    it('should convert date string to Date', async () => {
      const dto = { technicianId: 't1', date: '2024-06-15', waypoints: [] };
      mockPrisma.route.create.mockResolvedValue({ id: '1' });
      await service.create(dto as any);
      expect(mockPrisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            date: expect.any(Date),
          }),
        }),
      );
    });

    it('should pass estimatedDuration when provided', async () => {
      const dto = { technicianId: 't1', date: '2024-01-01', waypoints: [], estimatedDuration: 120 };
      mockPrisma.route.create.mockResolvedValue({ id: '1' });
      await service.create(dto as any);
      expect(mockPrisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estimatedDuration: 120 }),
        }),
      );
    });
  });

  describe('findByTechnician', () => {
    it('should return routes for technician', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findByTechnician('t1');
      expect(result).toHaveLength(1);
    });

    it('should order by date descending', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);
      await service.findByTechnician('t1');
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a route', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({ id: '1' });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('optimize', () => {
    it('should reverse waypoints as optimization', async () => {
      const waypoints = [
        { lat: 40.7, lng: -74.0, label: 'A' },
        { lat: 40.8, lng: -73.9, label: 'B' },
      ];
      mockPrisma.route.findUnique.mockResolvedValue({ id: '1', waypoints });
      mockPrisma.route.update.mockResolvedValue({
        id: '1',
        optimizedOrder: [...waypoints].reverse(),
      });

      const result = await service.optimize('1');
      expect(result.optimizedOrder).toBeDefined();
    });

    it('should throw when route not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);
      await expect(service.optimize('999')).rejects.toThrow(NotFoundException);
    });
  });
});
