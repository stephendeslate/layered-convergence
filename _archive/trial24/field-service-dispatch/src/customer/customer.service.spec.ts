import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service.js';

const mockPrisma = {
  customer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CustomerService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const dto = { companyId: 'c1', name: 'John', address: '123 St' };
      mockPrisma.customer.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result.name).toBe('John');
    });

    it('should pass all fields to prisma', async () => {
      const dto = { companyId: 'c1', name: 'Jane', address: '456 Ave', email: 'j@test.com' };
      mockPrisma.customer.create.mockResolvedValue({ id: '2', ...dto });

      await service.create(dto);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAllByCompany', () => {
    it('should return customers for a company', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([{ id: '1', name: 'C1' }]);

      const result = await service.findAllByCompany('c1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({ where: { companyId: 'c1' } });
    });

    it('should return empty array for company with no customers', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);

      const result = await service.findAllByCompany('c2');
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id and companyId', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'Test' });

      const result = await service.findOne('1', 'c1');
      expect(result.name).toBe('Test');
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'Old' });
      mockPrisma.customer.update.mockResolvedValue({ id: '1', name: 'New' });

      const result = await service.update('1', 'c1', { name: 'New' });
      expect(result.name).toBe('New');
    });

    it('should throw NotFoundException when updating non-existent customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.update('999', 'c1', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 'c1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when deleting non-existent customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.remove('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
