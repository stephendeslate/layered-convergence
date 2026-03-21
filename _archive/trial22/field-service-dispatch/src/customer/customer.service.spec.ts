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
      const dto = { companyId: 'c1', name: 'Jane', address: '123 Main' };
      mockPrisma.customer.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto as any);
      expect(result.name).toBe('Jane');
    });
  });

  describe('findAllByCompany', () => {
    it('should return customers for company', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAllByCompany('c1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'Jane' });
      const result = await service.findOne('1', 'c1');
      expect(result.name).toBe('Jane');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });

    it('should scope by both id and companyId', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      await service.findOne('1', 'c1');
      expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
        where: { id: '1', companyId: 'c1' },
      });
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', 'c1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw when not found', async () => {
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

    it('should throw when not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.remove('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
