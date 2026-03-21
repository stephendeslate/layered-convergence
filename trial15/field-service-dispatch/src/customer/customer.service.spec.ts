import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
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

const COMPANY_ID = 'company-1';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
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
      const dto = { name: 'Alice', email: 'alice@test.com', lat: 40.7, lng: -74.0, address: '123 Main St' };
      const expected = { id: '1', ...dto, companyId: COMPANY_ID };
      mockPrisma.customer.create.mockResolvedValue(expected);

      const result = await service.create(COMPANY_ID, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: { ...dto, companyId: COMPANY_ID },
      });
    });

    it('should include optional phone', async () => {
      const dto = { name: 'Bob', email: 'bob@test.com', lat: 40.7, lng: -74.0, address: '456 Oak Ave', phone: '555-0200' };
      mockPrisma.customer.create.mockResolvedValue({ id: '2', ...dto, companyId: COMPANY_ID });

      await service.create(COMPANY_ID, dto);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: { ...dto, companyId: COMPANY_ID },
      });
    });
  });

  describe('findAll', () => {
    it('should return all customers for a company', async () => {
      const customers = [{ id: '1', name: 'Alice', companyId: COMPANY_ID }];
      mockPrisma.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll(COMPANY_ID);
      expect(result).toEqual(customers);
    });

    it('should scope by companyId', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      await service.findAll(COMPANY_ID);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: { companyId: COMPANY_ID },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no customers', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      const result = await service.findAll(COMPANY_ID);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id and companyId', async () => {
      const customer = { id: '1', name: 'Alice', companyId: COMPANY_ID };
      mockPrisma.customer.findFirst.mockResolvedValue(customer);

      const result = await service.findOne('1', COMPANY_ID);
      expect(result).toEqual(customer);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });

    it('should use findFirst with companyId scope', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      await service.findOne('1', COMPANY_ID);
      expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
        where: { id: '1', companyId: COMPANY_ID },
      });
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', COMPANY_ID, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw if customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.update('bad', COMPANY_ID, { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should call update with correct params', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.update.mockResolvedValue({ id: '1', address: 'New Addr' });

      await service.update('1', COMPANY_ID, { address: 'New Addr' });
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { address: 'New Addr' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', COMPANY_ID);
      expect(result.id).toBe('1');
    });

    it('should throw if customer not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
