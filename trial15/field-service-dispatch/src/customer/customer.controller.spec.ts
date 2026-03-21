import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockReq = { companyId: 'company-1' } as CompanyRequest;

describe('CustomerController', () => {
  let controller: CustomerController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [{ provide: CustomerService, useValue: mockService }],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const dto = { name: 'Alice', email: 'a@t.com', lat: 40.7, lng: -74.0, address: '123 Main' };
      mockService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(mockReq, dto);
      expect(result.id).toBe('1');
      expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      mockService.findAll.mockResolvedValue([{ id: '1' }]);
      const result = await controller.findAll(mockReq);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      mockService.findOne.mockResolvedValue({ id: '1' });
      const result = await controller.findOne(mockReq, '1');
      expect(result.id).toBe('1');
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await controller.update(mockReq, '1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a customer', async () => {
      mockService.remove.mockResolvedValue({ id: '1' });
      const result = await controller.remove(mockReq, '1');
      expect(result.id).toBe('1');
    });
  });
});
