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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a route', async () => {
      mockPrisma.route.create.mockResolvedValue({
        id: '1',
        waypoints: [{ lat: 40.0, lng: -74.0 }],
      });
      const result = await service.create('comp-1', {
        technicianId: 'tech-1',
        date: '2025-01-15',
        waypoints: [{ lat: 40.0, lng: -74.0 }],
      });
      expect(result.id).toBe('1');
    });
  });

  describe('findAll', () => {
    it('should return routes for company', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });

    it('should filter by technicianId', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);
      await service.findAll('comp-1', 'tech-1');
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp-1', technicianId: 'tech-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: '1' });
      const result = await service.findOne('comp-1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', 'bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByTechnicianAndDate', () => {
    it('should find routes by technician and date', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findByTechnicianAndDate(
        'comp-1',
        'tech-1',
        '2025-01-15',
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.route.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('comp-1', '1');
      expect(result.id).toBe('1');
    });
  });
});
