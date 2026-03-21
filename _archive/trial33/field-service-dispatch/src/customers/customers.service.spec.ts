import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: any;

  const companyId = 'company-1';

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
    service = new CustomersService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a customer with companyId', async () => {
      const dto = { name: 'John', address: '123 Main St' };
      prisma.customer.create.mockResolvedValue({ id: 'cust-1', companyId, ...dto });

      const result = await service.create(companyId, dto as any);
      expect(result.companyId).toBe(companyId);
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ companyId, name: 'John' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return customers filtered by companyId', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: 'cust-1' }]);
      const result = await service.findAll(companyId);
      expect(result).toHaveLength(1);
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a customer by id and companyId', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', companyId });
      const result = await service.findOne(companyId, 'cust-1');
      expect(result.id).toBe('cust-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.findOne(companyId, 'nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', companyId });
      prisma.customer.update.mockResolvedValue({ id: 'cust-1', name: 'Updated' });

      const result = await service.update(companyId, 'cust-1', { name: 'Updated' } as any);
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', companyId });
      prisma.customer.delete.mockResolvedValue({ id: 'cust-1' });

      const result = await service.delete(companyId, 'cust-1');
      expect(result.id).toBe('cust-1');
    });
  });
});
