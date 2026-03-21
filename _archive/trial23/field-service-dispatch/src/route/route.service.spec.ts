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
      const dto = { technicianId: 't1', date: '2024-01-15', waypoints: [{ lat: 40.7, lng: -74.0 }], estimatedDuration: 120 };
      mockPrisma.route.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto as any);
      expect(result.id).toBe('1');
    });

    it('should convert date string to Date', async () => {
      const dto = { technicianId: 't1', date: '2024-01-15', waypoints: [], estimatedDuration: 60 };
      mockPrisma.route.create.mockResolvedValue({ id: '1' });
      await service.create(dto as any);
      expect(mockPrisma.route.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ date: expect.any(Date) }),
      });
    });
  });

  describe('findByTechnician', () => {
    it('should return routes for a technician', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findByTechnician('t1');
      expect(result).toHaveLength(1);
    });

    it('should order by date desc', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);
      await service.findByTechnician('t1');
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
        where: { technicianId: 't1' },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a route', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({ id: '1', waypoints: [] });
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
      const waypoints = [{ lat: 40.7, lng: -74.0, label: 'A' }, { lat: 40.8, lng: -74.1, label: 'B' }];
      mockPrisma.route.findUnique.mockResolvedValue({ id: '1', waypoints });
      mockPrisma.route.update.mockResolvedValue({ id: '1', optimizedOrder: [...waypoints].reverse() });
      const result = await service.optimize('1');
      expect(result.optimizedOrder[0].label).toBe('B');
    });

    it('should throw when route not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);
      await expect(service.optimize('999')).rejects.toThrow(NotFoundException);
    });
  });
});
