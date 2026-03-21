import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';

const mockPrisma = {
  invoice: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
};

const mockWorkOrderService = {
  transition: vi.fn(),
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InvoiceService(mockPrisma as any, mockWorkOrderService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromWorkOrder', () => {
    it('should create an invoice and transition work order to INVOICED', async () => {
      mockWorkOrderService.transition.mockResolvedValue({});
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv1', workOrderId: 'wo1', amount: 150 });
      const result = await service.createFromWorkOrder('wo1', 'c1', 150);
      expect(result.amount).toBe(150);
      expect(mockWorkOrderService.transition).toHaveBeenCalledWith('wo1', 'c1', 'INVOICED');
    });

    it('should pass correct data to invoice create', async () => {
      mockWorkOrderService.transition.mockResolvedValue({});
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv1' });
      await service.createFromWorkOrder('wo1', 'c1', 200);
      expect(mockPrisma.invoice.create).toHaveBeenCalledWith({
        data: { workOrderId: 'wo1', amount: 200 },
      });
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid and transition work order', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv1', workOrderId: 'wo1', workOrder: {} });
      mockWorkOrderService.transition.mockResolvedValue({});
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv1', status: 'PAID' });
      const result = await service.markPaid('inv1', 'c1');
      expect(result.status).toBe('PAID');
      expect(mockWorkOrderService.transition).toHaveBeenCalledWith('wo1', 'c1', 'PAID');
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.markPaid('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByCompany', () => {
    it('should return invoices for a company', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'inv1' }]);
      const result = await service.findAllByCompany('c1');
      expect(result).toHaveLength(1);
    });

    it('should filter by company through work order relation', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);
      await service.findAllByCompany('c1');
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
        where: { workOrder: { companyId: 'c1' } },
        include: { workOrder: true },
      });
    });
  });
});
