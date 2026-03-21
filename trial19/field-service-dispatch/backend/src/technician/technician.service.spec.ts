import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';

const mockPrisma = {
  technician: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('TechnicianService', () => {
  let service: TechnicianService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TechnicianService(mockPrisma as never);
  });

  describe('findAll', () => {
    it('should return technicians for a company', async () => {
      const techs = [{ id: '1', name: 'Mike', companyId: 'c1' }];
      mockPrisma.technician.findMany.mockResolvedValue(techs);

      const result = await service.findAll('c1');
      expect(result).toEqual(techs);
    });
  });

  describe('findById', () => {
    it('should return a technician when found', async () => {
      const tech = { id: '1', name: 'Mike', companyId: 'c1' };
      mockPrisma.technician.findFirst.mockResolvedValue(tech);

      const result = await service.findById('1', 'c1');
      expect(result).toEqual(tech);
    });

    it('should throw when technician not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findById('1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a technician with skills', async () => {
      const dto = { name: 'Mike', email: 'm@test.com', phone: '555', skills: ['HVAC', 'Plumbing'] };
      mockPrisma.technician.create.mockResolvedValue({ id: '1', ...dto, companyId: 'c1' });

      const result = await service.create(dto, 'c1');
      expect(result.companyId).toBe('c1');
    });
  });
});
