import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoutesService } from './routes.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RoutesService', () => {
  let service: RoutesService;
  let prisma: any;

  const companyId = 'company-1';

  beforeEach(() => {
    prisma = {
      route: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new RoutesService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a route with companyId', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2026-03-20',
        waypoints: [{ lat: 40.0, lng: -74.0 }],
      };
      prisma.route.create.mockResolvedValue({ id: 'route-1', companyId });

      const result = await service.create(companyId, dto as any);
      expect(result.companyId).toBe(companyId);
      expect(prisma.route.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ companyId, technicianId: 'tech-1' }),
        include: { technician: true },
      });
    });

    it('should default optimizedOrder to empty array', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2026-03-20',
        waypoints: [],
      };
      prisma.route.create.mockResolvedValue({ id: 'route-1' });

      await service.create(companyId, dto as any);
      expect(prisma.route.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ optimizedOrder: [] }),
        include: { technician: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return routes filtered by companyId', async () => {
      prisma.route.findMany.mockResolvedValue([{ id: 'route-1' }]);
      const result = await service.findAll(companyId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a route by id and companyId', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: 'route-1' });
      const result = await service.findOne(companyId, 'route-1');
      expect(result.id).toBe('route-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);
      await expect(service.findOne(companyId, 'nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTechnician', () => {
    it('should return routes for a technician', async () => {
      prisma.route.findMany.mockResolvedValue([{ id: 'route-1' }]);
      const result = await service.findByTechnician(companyId, 'tech-1');
      expect(result).toHaveLength(1);
      expect(prisma.route.findMany).toHaveBeenCalledWith({
        where: { companyId, technicianId: 'tech-1' },
        include: { technician: true },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('delete', () => {
    it('should delete a route', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: 'route-1' });
      prisma.route.delete.mockResolvedValue({ id: 'route-1' });

      const result = await service.delete(companyId, 'route-1');
      expect(result.id).toBe('route-1');
    });
  });
});
