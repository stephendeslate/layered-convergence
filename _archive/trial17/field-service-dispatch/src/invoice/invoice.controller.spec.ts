import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller.js';
import { InvoiceService } from './invoice.service.js';

const mockService = {
  createForWorkOrder: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
};

describe('InvoiceController', () => {
  let controller: InvoiceController;
  const companyId = 'company-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [{ provide: InvoiceService, useValue: mockService }],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createForWorkOrder with companyId, workOrderId, and dto', async () => {
      const req = { companyId } as any;
      const dto = { amount: 100 };
      mockService.createForWorkOrder.mockResolvedValue({ id: 'inv-1' });

      await controller.create(req, 'wo-1', dto as any);
      expect(mockService.createForWorkOrder).toHaveBeenCalledWith(companyId, 'wo-1', dto);
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
    it('should call service.findOne with id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'inv-1' });

      await controller.findOne('inv-1');
      expect(mockService.findOne).toHaveBeenCalledWith('inv-1');
    });
  });
});
