import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  markPaid: vi.fn(),
  findByWorkOrder: vi.fn(),
};

const mockReq = { companyId: 'company-1' } as CompanyRequest;

describe('InvoiceController', () => {
  let controller: InvoiceController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [{ provide: InvoiceService, useValue: mockService }],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice', async () => {
      const dto = { amount: 100, workOrderId: 'wo-1' };
      mockService.create.mockResolvedValue({ id: 'inv-1', ...dto });

      const result = await controller.create(mockReq, dto);
      expect(result.id).toBe('inv-1');
      expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return all invoices', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'inv-1' }]);
      const result = await controller.findAll(mockReq);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an invoice by id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'inv-1' });
      const result = await controller.findOne(mockReq, 'inv-1');
      expect(result.id).toBe('inv-1');
    });
  });

  describe('update', () => {
    it('should update an invoice', async () => {
      mockService.update.mockResolvedValue({ id: 'inv-1', amount: 200 });
      const result = await controller.update(mockReq, 'inv-1', { amount: 200 });
      expect(result.amount).toBe(200);
    });
  });

  describe('remove', () => {
    it('should remove an invoice', async () => {
      mockService.remove.mockResolvedValue({ id: 'inv-1' });
      const result = await controller.remove(mockReq, 'inv-1');
      expect(result.id).toBe('inv-1');
    });
  });

  describe('markPaid', () => {
    it('should mark an invoice as paid', async () => {
      mockService.markPaid.mockResolvedValue({ id: 'inv-1', paidAt: new Date() });
      const result = await controller.markPaid(mockReq, 'inv-1');
      expect(result.paidAt).toBeDefined();
    });
  });

  describe('findByWorkOrder', () => {
    it('should return invoices for a work order', async () => {
      mockService.findByWorkOrder.mockResolvedValue([{ id: 'inv-1' }]);
      const result = await controller.findByWorkOrder(mockReq, 'wo-1');
      expect(result).toHaveLength(1);
    });
  });
});
