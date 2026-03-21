import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

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
    it('should create a customer', async () => {
      const dto = {
        companyId: 'co-1',
        name: 'Jane Doe',
        address: '123 Main St',
      };
      const expected = { id: 'cust-1', ...dto };
      mockPrisma.customer.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAllByCompany', () => {
    it('should return customers for a company', async () => {
      const expected = [{ id: 'cust-1', companyId: 'co-1' }];
      mockPrisma.customer.findMany.mockResolvedValue(expected);

      const result = await service.findAllByCompany('co-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a customer scoped by company', async () => {
      const expected = { id: 'cust-1', companyId: 'co-1' };
      mockPrisma.customer.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('cust-1', 'co-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('no', 'co')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const existing = { id: 'cust-1', companyId: 'co-1' };
      mockPrisma.customer.findFirst.mockResolvedValue(existing);
      const updated = { ...existing, name: 'Updated' };
      mockPrisma.customer.update.mockResolvedValue(updated);

      const result = await service.update('cust-1', 'co-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      const existing = { id: 'cust-1', companyId: 'co-1' };
      mockPrisma.customer.findFirst.mockResolvedValue(existing);
      mockPrisma.customer.delete.mockResolvedValue(existing);

      const result = await service.remove('cust-1', 'co-1');
      expect(result).toEqual(existing);
    });
  });
});
