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
    deleteMany: vi.fn(),
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

  it('should create a customer', async () => {
    const dto = { name: 'Alice', address: '123 Main St' };
    const expected = { id: '1', companyId, ...dto };
    mockPrisma.customer.create.mockResolvedValue(expected);

    const result = await service.create(companyId, dto);
    expect(result).toEqual(expected);
    expect(mockPrisma.customer.create).toHaveBeenCalledWith({
      data: { ...dto, companyId },
    });
  });

  it('should find all customers scoped by companyId', async () => {
    const expected = [{ id: '1', name: 'Alice' }];
    mockPrisma.customer.findMany.mockResolvedValue(expected);

    const result = await service.findAll(companyId);
    expect(result).toEqual(expected);
    expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({ where: { companyId } });
  });

  it('should find one customer', async () => {
    const expected = { id: '1', name: 'Alice' };
    mockPrisma.customer.findFirstOrThrow.mockResolvedValue(expected);

    const result = await service.findOne(companyId, '1');
    expect(result).toEqual(expected);
  });

  it('should update a customer', async () => {
    const dto = { name: 'Bob' };
    const expected = { id: '1', ...dto };
    mockPrisma.customer.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.customer.findUniqueOrThrow.mockResolvedValue(expected);

    const result = await service.update(companyId, '1', dto);
    expect(result).toEqual(expected);
  });

  it('should delete a customer', async () => {
    mockPrisma.customer.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.remove(companyId, '1');
    expect(result).toEqual({ count: 1 });
  });
});
