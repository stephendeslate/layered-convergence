import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
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
    const module = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(CustomersService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const dto = { name: 'Jane', address: '123 Main St' };
      mockPrisma.customer.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create('comp-1', dto);
      expect(result.name).toBe('Jane');
    });
  });

  describe('findAll', () => {
    it('should return customers for company', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return customer when found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      const result = await service.findOne('comp-1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('comp-1', '1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('comp-1', '1');
      expect(result.id).toBe('1');
    });
  });
});
