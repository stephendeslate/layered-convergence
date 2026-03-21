import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  workOrder: {
    findMany: vi.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;
  const companyId = 'company-1';

  beforeEach(() => {
    service = new RouteService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a route', async () => {
      mockPrisma.route.create.mockResolvedValue({
        id: 'route-1',
        name: 'Morning Route',
        companyId,
      });

      const result = await service.create(companyId, {
        name: 'Morning Route',
        date: '2024-01-15T00:00:00.000Z',
      });

      expect(result.id).toBe('route-1');
    });

    it('should build waypoints from work order IDs', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([
        {
          id: 'wo-1',
          title: 'Fix AC',
          companyId,
          customer: { latitude: 40.7128, longitude: -74.006, address: '123 Main St' },
        },
        {
          id: 'wo-2',
          title: 'Fix Heater',
          companyId,
          customer: { latitude: 40.758, longitude: -73.9855, address: '456 Broadway' },
        },
      ]);
      mockPrisma.route.create.mockResolvedValue({
        id: 'route-1',
        name: 'Morning Route',
        companyId,
      });

      await service.create(companyId, {
        name: 'Morning Route',
        date: '2024-01-15T00:00:00.000Z',
        workOrderIds: ['wo-1', 'wo-2'],
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

  describe('findOne', () => {
    it('should return a route', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({
        id: 'route-1',
        companyId,
      });

      const result = await service.findOne(companyId, 'route-1');
      expect(result.id).toBe('route-1');
    });

    it('should throw NotFoundException for wrong company', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({
        id: 'route-1',
        companyId: 'other-company',
      });

      await expect(service.findOne(companyId, 'route-1')).rejects.toThrow(NotFoundException);
    });
  });
});
