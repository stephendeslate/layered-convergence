import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
};

describe('RoutesService', () => {
  let service: RoutesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(RoutesService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = {
        technicianId: 'tech-1',
        date: '2024-01-15',
        waypoints: [{ lat: 40, lng: -74 }],
      };
      mockPrisma.route.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create('comp-1', dto);
      expect(result.id).toBe('1');
    });
  });

  describe('findAll', () => {
    it('should return routes for company', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return route when found', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: '1' });
      const result = await service.findOne('comp-1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTechnician', () => {
    it('should return routes for technician', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: '1', technicianId: 'tech-1' }]);
      const result = await service.findByTechnician('comp-1', 'tech-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.route.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('comp-1', '1');
      expect(result.id).toBe('1');
    });
  });
});
