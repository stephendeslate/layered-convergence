import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
};

describe('CustomerController', () => {
  let controller: CustomerController;
  const companyId = 'company-1';

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

  describe('create', () => {
    it('should call service.create with companyId and dto', async () => {
      const dto = { name: 'Jane', address: '123 Main St', lat: 40.7128, lng: -74.006 };
      const req = { companyId } as any;
      mockService.create.mockResolvedValue({ id: 'cust-1' });

      await controller.create(req, dto as any);
      expect(mockService.create).toHaveBeenCalledWith(companyId, dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with companyId', async () => {
      const req = { companyId } as any;
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(req);
      expect(mockService.findAll).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with companyId and id', async () => {
      const req = { companyId } as any;
      mockService.findOne.mockResolvedValue({ id: 'cust-1' });

      await controller.findOne(req, 'cust-1');
      expect(mockService.findOne).toHaveBeenCalledWith(companyId, 'cust-1');
    });
  });

  describe('update', () => {
    it('should call service.update with companyId, id, and dto', async () => {
      const req = { companyId } as any;
      const dto = { name: 'Updated' };
      mockService.update.mockResolvedValue({ id: 'cust-1', name: 'Updated' });

      await controller.update(req, 'cust-1', dto as any);
      expect(mockService.update).toHaveBeenCalledWith(companyId, 'cust-1', dto);
    });
  });
});
