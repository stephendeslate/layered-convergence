import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { WorkOrderStatus } from '@prisma/client';

const mockPrisma = {
  invoice: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  workOrder: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InvoiceService(mockPrisma as never);
  });

  describe('findAll', () => {
    it('should return invoices for a company', async () => {
      const invoices = [{ id: '1', amount: '100.00' }];
      mockPrisma.invoice.findMany.mockResolvedValue(invoices);

      const result = await service.findAll('c1');
      expect(result).toEqual(invoices);
    });
  });

  describe('create', () => {
    it('should create an invoice for a completed work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.COMPLETED,
        companyId: 'c1',
      });
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv1',
        amount: '100.00',
        tax: '10.00',
        total: '110.00',
      });
      mockPrisma.workOrder.update.mockResolvedValue({});

      const result = await service.create(
        { amount: '100.00', tax: '10.00', total: '110.00', workOrderId: 'wo1' },
        'c1',
      );
      expect(result.id).toBe('inv1');
    });

    it('should reject invoice for non-completed work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.PENDING,
        companyId: 'c1',
      });

      await expect(
        service.create(
          { amount: '100.00', tax: '10.00', total: '110.00', workOrderId: 'wo1' },
          'c1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invoice for missing work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          { amount: '100.00', tax: '10.00', total: '110.00', workOrderId: 'wo1' },
          'c1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
