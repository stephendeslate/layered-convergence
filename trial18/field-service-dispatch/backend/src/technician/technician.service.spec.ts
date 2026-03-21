import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: {
    technician: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      technician: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new TechnicianService(prisma as unknown as PrismaService);
  });

  it('should find all technicians for a company', async () => {
    prisma.technician.findMany.mockResolvedValue([]);
    const result = await service.findAll('company-1');
    expect(prisma.technician.findMany).toHaveBeenCalledWith({ where: { companyId: 'company-1' } });
    expect(result).toEqual([]);
  });

  it('should find technician by id with tenant isolation', async () => {
    const tech = { id: 'tech-1', name: 'Jane', companyId: 'company-1' };
    prisma.technician.findFirst.mockResolvedValue(tech);
    const result = await service.findById('tech-1', 'company-1');
    expect(result).toEqual(tech);
  });

  it('should throw NotFoundException if technician not found', async () => {
    prisma.technician.findFirst.mockResolvedValue(null);
    await expect(service.findById('tech-1', 'company-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a technician', async () => {
    const dto = { name: 'Jane', email: 'jane@test.com', phone: '555-5678', specialties: ['HVAC'] };
    prisma.technician.create.mockResolvedValue({ id: 'tech-1', ...dto, companyId: 'company-1' });
    const result = await service.create(dto, 'company-1');
    expect(result.id).toBe('tech-1');
  });
});
