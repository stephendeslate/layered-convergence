import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';

const mockPrisma = {
  customer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('CustomerService', () => {
  let service: CustomerService;
  const companyId = 'company-1';

  beforeEach(() => {
    service = new CustomerService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      mockPrisma.customer.create.mockResolvedValue({
        id: 'cust-1',
        name: 'Customer 1',
        address: '123 Main St',
        companyId,
      });

      const result = await service.create(companyId, {
        name: 'Customer 1',
        address: '123 Main St',
      });

      expect(result.id).toBe('cust-1');
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Customer 1', companyId }),
      });
    });
  });

  describe('findOne', () => {
    it('should return a customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({
        id: 'cust-1',
        companyId,
      });

      const result = await service.findOne(companyId, 'cust-1');
      expect(result.id).toBe('cust-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne(companyId, 'cust-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for different company', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({
        id: 'cust-1',
        companyId: 'other-company',
      });

      await expect(service.findOne(companyId, 'cust-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({
        id: 'cust-1',
        companyId,
      });
      mockPrisma.customer.update.mockResolvedValue({
        id: 'cust-1',
        name: 'Updated Name',
        companyId,
      });

      const result = await service.update(companyId, 'cust-1', { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });
  });
});
