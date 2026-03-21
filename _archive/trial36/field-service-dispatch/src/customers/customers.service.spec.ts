import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      customer: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should create a customer scoped to company', async () => {
    const dto = { name: 'John Doe', address: '123 Main St' };
    prisma.customer.create.mockResolvedValue({ id: '1', ...dto, companyId });
    const result = await service.create(companyId, dto);
    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: { ...dto, companyId },
    });
    expect(result.companyId).toBe(companyId);
  });

  it('should find all customers for a company', async () => {
    prisma.customer.findMany.mockResolvedValue([{ id: '1', companyId }]);
    const result = await service.findAll(companyId);
    expect(prisma.customer.findMany).toHaveBeenCalledWith({ where: { companyId } });
    expect(result).toHaveLength(1);
  });

  it('should find one customer scoped to company', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: '1', companyId });
    const result = await service.findOne(companyId, '1');
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException when customer not found', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);
    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a customer', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: '1', companyId });
    prisma.customer.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await service.update(companyId, '1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a customer', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: '1', companyId });
    prisma.customer.delete.mockResolvedValue({ id: '1' });
    await service.remove(companyId, '1');
    expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should create customer with geocoded lat/lng', async () => {
    const dto = { name: 'Jane', address: '456 Oak Ave', lat: 40.7, lng: -74.0 };
    prisma.customer.create.mockResolvedValue({ id: '2', ...dto, companyId });
    const result = await service.create(companyId, dto);
    expect(result.lat).toBe(40.7);
    expect(result.lng).toBe(-74.0);
  });
});
