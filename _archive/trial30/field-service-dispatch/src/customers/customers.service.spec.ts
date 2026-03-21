import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  customer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CustomersService>(CustomersService);
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const dto = { name: 'Alice', email: 'alice@test.com', address: '123 Main St' };
      mockPrisma.customer.create.mockResolvedValue({ id: 'cust1', ...dto });
      const result = await service.create('comp1', dto);
      expect(result.name).toBe('Alice');
    });
  });

  describe('findAll', () => {
    it('should return all customers for company', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([{ id: 'cust1' }]);
      const result = await service.findAll('comp1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return customer when found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust1' });
      const result = await service.findOne('comp1', 'cust1');
      expect(result.id).toBe('cust1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp1', 'cust999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust1' });
      mockPrisma.customer.update.mockResolvedValue({ id: 'cust1', name: 'Bob' });
      const result = await service.update('comp1', 'cust1', { name: 'Bob' });
      expect(result.name).toBe('Bob');
    });
  });

  describe('delete', () => {
    it('should delete customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust1' });
      mockPrisma.customer.delete.mockResolvedValue({ id: 'cust1' });
      const result = await service.delete('comp1', 'cust1');
      expect(result.id).toBe('cust1');
    });
  });
});
