import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: {
    company: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  const mockCompany = {
    id: 'c1',
    name: 'Test Company',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      company: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    };
    service = new CompanyService(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('should return a company', async () => {
      prisma.company.findUnique.mockResolvedValue(mockCompany);

      const result = await service.findById('c1');
      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.company.findUnique.mockResolvedValue(null);

      await expect(service.findById('bad')).rejects.toThrow(NotFoundException);
    });

    it('should call findUnique with correct id', async () => {
      prisma.company.findUnique.mockResolvedValue(mockCompany);

      await service.findById('c1');

      expect(prisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const companies = [mockCompany, { ...mockCompany, id: 'c2', name: 'Co 2' }];
      prisma.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no companies', async () => {
      prisma.company.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });
});
