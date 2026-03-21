import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: {
    customer: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const mockCustomer = {
    id: 'cu1',
    name: 'Customer One',
    email: 'customer@example.com',
    phone: '555-5678',
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.006,
    companyId: 'c1',
  };

  beforeEach(() => {
    prisma = {
      customer: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new CustomerService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a customer', async () => {
      prisma.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create('c1', {
        name: 'Customer One',
        email: 'customer@example.com',
        phone: '555-5678',
        address: '123 Main St',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should return all customers for company', async () => {
      prisma.customer.findMany.mockResolvedValue([mockCustomer]);

      const result = await service.findAll('c1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);

      const result = await service.findById('c1', 'cu1');
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findById('c1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);
      prisma.customer.update.mockResolvedValue({ ...mockCustomer, name: 'Updated' });

      const result = await service.update('c1', 'cu1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);
      prisma.customer.delete.mockResolvedValue(mockCustomer);

      const result = await service.remove('c1', 'cu1');
      expect(result).toEqual(mockCustomer);
    });
  });
});
