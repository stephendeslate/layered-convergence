import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('RoutesService', () => {
  let service: RoutesService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<RoutesService>(RoutesService);
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = { technicianId: 't1', date: '2024-01-15', waypoints: [], estimatedDuration: 120 };
      mockPrisma.route.create.mockResolvedValue({ id: 'r1', ...dto });
      const result = await service.create('comp1', dto);
      expect(result.id).toBe('r1');
    });
  });

  describe('findAll', () => {
    it('should return all routes for company', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: 'r1' }]);
      const result = await service.findAll('comp1');
      expect(result).toHaveLength(1);
    });

    it('should filter by technicianId', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);
      await service.findAll('comp1', 't1');
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp1', technicianId: 't1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return route when found', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1' });
      const result = await service.findOne('comp1', 'r1');
      expect(result.id).toBe('r1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp1', 'r999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTechnicianAndDate', () => {
    it('should find routes for technician on date', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: 'r1' }]);
      const result = await service.findByTechnicianAndDate('comp1', 't1', '2024-01-15');
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1' });
      mockPrisma.route.update.mockResolvedValue({ id: 'r1', estimatedDuration: 90 });
      const result = await service.update('comp1', 'r1', { estimatedDuration: 90 });
      expect(result.estimatedDuration).toBe(90);
    });
  });

  describe('delete', () => {
    it('should delete route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1' });
      mockPrisma.route.delete.mockResolvedValue({ id: 'r1' });
      const result = await service.delete('comp1', 'r1');
      expect(result.id).toBe('r1');
    });
  });
});
