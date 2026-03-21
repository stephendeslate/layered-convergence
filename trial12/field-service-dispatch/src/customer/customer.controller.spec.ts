import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('CustomerController', () => {
  let controller: CustomerController;
  const mockReq = { companyId: 'company-1' } as any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [{ provide: CustomerService, useValue: mockService }],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a customer', async () => {
    const dto = { name: 'Alice', address: '123 Main St' };
    const expected = { id: '1', ...dto };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
  });

  it('should find all customers', async () => {
    const expected = [{ id: '1', name: 'Alice' }];
    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(mockReq);
    expect(result).toEqual(expected);
  });

  it('should find one customer', async () => {
    const expected = { id: '1', name: 'Alice' };
    mockService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne(mockReq, '1');
    expect(result).toEqual(expected);
  });

  it('should update a customer', async () => {
    const dto = { name: 'Bob' };
    mockService.update.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.update(mockReq, '1', dto);
    expect(result).toEqual({ id: '1', ...dto });
  });

  it('should remove a customer', async () => {
    mockService.remove.mockResolvedValue({ count: 1 });

    const result = await controller.remove(mockReq, '1');
    expect(result).toEqual({ count: 1 });
  });
});
