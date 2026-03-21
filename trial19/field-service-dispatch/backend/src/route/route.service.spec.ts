import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';

const mockPrisma = {
  route: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RouteService(mockPrisma as never);
  });

  describe('findAll', () => {
    it('should return routes for a company', async () => {
      const routes = [{ id: '1', name: 'Route A', companyId: 'c1' }];
      mockPrisma.route.findMany.mockResolvedValue(routes);

      const result = await service.findAll('c1');
      expect(result).toEqual(routes);
    });
  });

  describe('findById', () => {
    it('should throw when route not found', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);

      await expect(service.findById('1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a route with stops and distance', async () => {
      const dto = { name: 'Route A', date: '2026-03-21', distance: 15.5, stops: 3, technicianId: 't1' };
      mockPrisma.route.create.mockResolvedValue({ id: '1', ...dto, companyId: 'c1' });

      const result = await service.create(dto, 'c1');
      expect(result.companyId).toBe('c1');
    });
  });
});
