import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('TechnicianService', () => {
  let service: TechnicianService;
  const companyId = 'company-1';

  beforeEach(() => {
    service = new TechnicianService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      mockPrisma.technician.create.mockResolvedValue({
        id: 'tech-1',
        email: 'tech@example.com',
        name: 'John Tech',
        companyId,
      });

      const result = await service.create(companyId, {
        email: 'tech@example.com',
        name: 'John Tech',
      });

      expect(result.id).toBe('tech-1');
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'tech@example.com',
          name: 'John Tech',
          companyId,
          skills: [],
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return technicians for company', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'Tech 1', companyId },
      ]);

      const result = await service.findAll(companyId);
      expect(result).toHaveLength(1);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a technician', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-1',
        companyId,
      });

      const result = await service.findOne(companyId, 'tech-1');
      expect(result.id).toBe('tech-1');
    });

    it('should throw NotFoundException for different company', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-1',
        companyId: 'other-company',
      });

      await expect(service.findOne(companyId, 'tech-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAvailable', () => {
    it('should return only available technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', availability: 'AVAILABLE', companyId },
      ]);

      const result = await service.findAvailable(companyId);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId, availability: 'AVAILABLE' },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });
});
