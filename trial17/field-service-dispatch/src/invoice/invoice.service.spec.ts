import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { InvoiceService } from './invoice.service';

const mockPrisma = {
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  workOrder: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('InvoiceService', () => {
  let service: InvoiceService;
  const companyId = 'company-1';

  beforeEach(() => {
    service = new InvoiceService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invoice with Decimal amounts', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'COMPLETED',
      });
      mockPrisma.invoice.count.mockResolvedValue(0);
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        number: 'INV-00001',
        amount: new Decimal('100.00'),
        tax: new Decimal('8.50'),
        total: new Decimal('108.50'),
        companyId,
      });
      mockPrisma.workOrder.update.mockResolvedValue({});

      const result = await service.create(companyId, {
        workOrderId: 'wo-1',
        amount: 100,
        tax: 8.5,
      });

      expect(result.number).toBe('INV-00001');
      expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: expect.any(Decimal),
            tax: expect.any(Decimal),
            total: expect.any(Decimal),
          }),
        }),
      );
    });

    it('should throw NotFoundException for missing work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.create(companyId, { workOrderId: 'wo-999', amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if work order not completed', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'CREATED',
      });

      await expect(
        service.create(companyId, { workOrderId: 'wo-1', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transition work order to INVOICED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-1',
        companyId,
        status: 'COMPLETED',
      });
      mockPrisma.invoice.count.mockResolvedValue(5);
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        number: 'INV-00006',
        amount: new Decimal('200.00'),
        tax: new Decimal('0'),
        total: new Decimal('200.00'),
        companyId,
      });
      mockPrisma.workOrder.update.mockResolvedValue({});

      await service.create(companyId, { workOrderId: 'wo-1', amount: 200 });

      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: { status: 'INVOICED' },
      });
    });
  });

  describe('markPaid', () => {
    it('should set paidAt timestamp', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        companyId,
      });
      mockPrisma.invoice.update.mockResolvedValue({
        id: 'inv-1',
        paidAt: new Date(),
      });

      const result = await service.markPaid(companyId, 'inv-1');
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { paidAt: expect.any(Date) },
        }),
      );
    });
  });
});
