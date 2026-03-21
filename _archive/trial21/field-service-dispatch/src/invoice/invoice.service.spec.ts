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
    it('should create invoice and transition to INVOICED', async () => {
      mockWorkOrderService.transition.mockResolvedValue({ id: 'wo1', status: 'INVOICED' });
      mockPrisma.invoice.create.mockResolvedValue({ id: '1', workOrderId: 'wo1', amount: 150 });

      const result = await service.createFromWorkOrder('wo1', 'c1', 150);
      expect(result.amount).toBe(150);
      expect(mockWorkOrderService.transition).toHaveBeenCalledWith('wo1', 'c1', 'INVOICED');
    });

    it('should propagate transition errors', async () => {
      mockWorkOrderService.transition.mockRejectedValue(new Error('Invalid transition'));
      await expect(service.createFromWorkOrder('wo1', 'c1', 100)).rejects.toThrow('Invalid transition');
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid and transition to PAID', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: '1',
        workOrderId: 'wo1',
        workOrder: { companyId: 'c1' },
      });
      mockWorkOrderService.transition.mockResolvedValue({ id: 'wo1', status: 'PAID' });
      mockPrisma.invoice.update.mockResolvedValue({ id: '1', status: 'PAID' });

      const result = await service.markPaid('1', 'c1');
      expect(result.status).toBe('PAID');
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.markPaid('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByCompany', () => {
    it('should return invoices scoped to company', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAllByCompany('c1');
      expect(result).toHaveLength(1);
    });

    it('should include work order in results', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);
      await service.findAllByCompany('c1');
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { workOrder: true },
        }),
      );
    });
  });
});
