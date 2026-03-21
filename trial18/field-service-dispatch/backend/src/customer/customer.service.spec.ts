import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: {
    customer: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      customer: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new CustomerService(prisma as unknown as PrismaService);
  });

  it('should find all customers for a company', async () => {
    prisma.customer.findMany.mockResolvedValue([]);
    const result = await service.findAll('company-1');
    expect(prisma.customer.findMany).toHaveBeenCalledWith({ where: { companyId: 'company-1' } });
    expect(result).toEqual([]);
  });

  it('should find customer by id with tenant isolation', async () => {
    const customer = { id: 'cust-1', name: 'John', companyId: 'company-1' };
    prisma.customer.findFirst.mockResolvedValue(customer);
    const result = await service.findById('cust-1', 'company-1');
    expect(prisma.customer.findFirst).toHaveBeenCalledWith({
      where: { id: 'cust-1', companyId: 'company-1' },
    });
    expect(result).toEqual(customer);
  });

  it('should throw NotFoundException if customer not found', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);
    await expect(service.findById('cust-1', 'company-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a customer', async () => {
    const dto = { name: 'John', email: 'john@test.com', phone: '555-1234', address: '123 Main St' };
    prisma.customer.create.mockResolvedValue({ id: 'cust-1', ...dto, companyId: 'company-1' });
    const result = await service.create(dto, 'company-1');
    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: { ...dto, companyId: 'company-1' },
    });
    expect(result.id).toBe('cust-1');
  });
});
