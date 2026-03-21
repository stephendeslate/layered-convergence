import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechniciansService } from './technicians.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let prisma: any;

  const companyId = 'company-1';

  beforeEach(() => {
    prisma = {
      technician: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new TechniciansService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a technician with companyId', async () => {
      const dto = { name: 'Tech 1', email: 'tech@example.com' };
      prisma.technician.create.mockResolvedValue({ id: 'tech-1', companyId, ...dto });

      const result = await service.create(companyId, dto as any);
      expect(result.companyId).toBe(companyId);
    });

    it('should default skills to empty array', async () => {
      const dto = { name: 'Tech 1', email: 'tech@example.com' };
      prisma.technician.create.mockResolvedValue({ id: 'tech-1' });

      await service.create(companyId, dto as any);
      expect(prisma.technician.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ skills: [] }),
      });
    });
  });

  describe('findAll', () => {
    it('should return technicians filtered by companyId', async () => {
      prisma.technician.findMany.mockResolvedValue([{ id: 'tech-1' }]);
      const result = await service.findAll(companyId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a technician by id and companyId', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      const result = await service.findOne(companyId, 'tech-1');
      expect(result.id).toBe('tech-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne(companyId, 'nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      prisma.technician.update.mockResolvedValue({ id: 'tech-1', name: 'Updated' });

      const result = await service.update(companyId, 'tech-1', { name: 'Updated' } as any);
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      prisma.technician.delete.mockResolvedValue({ id: 'tech-1' });

      const result = await service.delete(companyId, 'tech-1');
      expect(result.id).toBe('tech-1');
    });
  });

  describe('findAvailable', () => {
    it('should return available technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', status: 'AVAILABLE' },
      ]);

      const result = await service.findAvailable(companyId);
      expect(result).toHaveLength(1);
      expect(prisma.technician.findMany).toHaveBeenCalledWith({
        where: { companyId, status: 'AVAILABLE' },
      });
    });
  });

  describe('findNearest', () => {
    it('should return nearest available technician', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', currentLat: 40.0, currentLng: -74.0, status: 'AVAILABLE' },
        { id: 'tech-2', currentLat: 40.1, currentLng: -74.1, status: 'AVAILABLE' },
      ]);

      const result = await service.findNearest(companyId, 40.0, -74.0);
      expect(result!.id).toBe('tech-1');
    });

    it('should return null when no available technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([]);
      const result = await service.findNearest(companyId, 40.0, -74.0);
      expect(result).toBeNull();
    });

    it('should skip technicians without coordinates', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', currentLat: null, currentLng: null, status: 'AVAILABLE' },
        { id: 'tech-2', currentLat: 40.05, currentLng: -74.05, status: 'AVAILABLE' },
      ]);

      const result = await service.findNearest(companyId, 40.0, -74.0);
      expect(result!.id).toBe('tech-2');
    });
  });
});
