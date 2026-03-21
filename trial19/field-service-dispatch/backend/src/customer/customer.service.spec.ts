import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';

const mockPrisma = {
  customer: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CustomerService(mockPrisma as never);
  });

  describe('findAll', () => {
    it('should return customers for a company', async () => {
      const customers = [{ id: '1', name: 'John', companyId: 'c1' }];
      mockPrisma.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll('c1');
      expect(result).toEqual(customers);
    });
  });

  describe('findById', () => {
    it('should return a customer when found', async () => {
      const customer = { id: '1', name: 'John', companyId: 'c1' };
      mockPrisma.customer.findFirst.mockResolvedValue(customer);

      const result = await service.findById('1', 'c1');
      expect(result).toEqual(customer);
    });

    it('should throw when customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findById('1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a customer with companyId', async () => {
      const dto = { name: 'John', email: 'j@test.com', phone: '555', address: '1 St' };
      mockPrisma.customer.create.mockResolvedValue({ id: '1', ...dto, companyId: 'c1' });

      const result = await service.create(dto, 'c1');
      expect(result.companyId).toBe('c1');
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: { ...dto, companyId: 'c1' },
      });
    });
  });
});
