import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { CustomerService } from './customer.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  customer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
};

describe('CustomerService', () => {
  let service: CustomerService;
  const companyId = 'company-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer with companyId', async () => {
      const dto = { name: 'Jane', address: '123 Main St', lat: 40.7128, lng: -74.006 };
      const expected = { id: 'cust-1', ...dto, companyId };
      mockPrisma.customer.create.mockResolvedValue(expected);

      const result = await service.create(companyId, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: { ...dto, companyId },
      });
    });

    it('should create customer with optional phone and email', async () => {
      const dto = { name: 'Jane', address: '123 Main St', lat: 40.7128, lng: -74.006, phone: '555-0100', email: 'jane@test.com' };
      mockPrisma.customer.create.mockResolvedValue({ id: 'cust-1', ...dto });

      await service.create(companyId, dto);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: { ...dto, companyId },
      });
    });
  });

  describe('findAll', () => {
    it('should return customers scoped by companyId', async () => {
      const expected = [{ id: 'cust-1' }];
      mockPrisma.customer.findMany.mockResolvedValue(expected);

      const result = await service.findAll(companyId);
      expect(result).toEqual(expected);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({ where: { companyId } });
    });

    it('should return empty array when no customers', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find customer scoped by companyId', async () => {
      const expected = { id: 'cust-1', companyId };
      mockPrisma.customer.findFirstOrThrow.mockResolvedValue(expected);

      const result = await service.findOne(companyId, 'cust-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.customer.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 'cust-1', companyId },
      });
    });
  });

  describe('update', () => {
    it('should update customer scoped by companyId', async () => {
      const dto = { name: 'Updated' };
      mockPrisma.customer.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.customer.findUniqueOrThrow.mockResolvedValue({ id: 'cust-1', name: 'Updated' });

      const result = await service.update(companyId, 'cust-1', dto);
      expect(result.name).toBe('Updated');
      expect(mockPrisma.customer.updateMany).toHaveBeenCalledWith({
        where: { id: 'cust-1', companyId },
        data: dto,
      });
    });

    it('should update customer address and coordinates', async () => {
      const dto = { address: '456 Oak Ave', lat: 41.0, lng: -75.0 };
      mockPrisma.customer.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.customer.findUniqueOrThrow.mockResolvedValue({ id: 'cust-1', ...dto });

      const result = await service.update(companyId, 'cust-1', dto);
      expect(result.address).toBe('456 Oak Ave');
    });
  });
});
