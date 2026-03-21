import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  workOrder: {
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
  },
  workOrderStatusHistory: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('InvoiceService', () => {
  let service: InvoiceService;
  const companyId = 'company-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice from a COMPLETED work order', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'COMPLETED',
        companyId,
      });

      const invoice = { id: 'inv-1', workOrderId: 'wo-1', amount: 150 };
      mockPrisma.$transaction.mockResolvedValue([invoice, {}, {}]);

      const result = await service.create(companyId, { workOrderId: 'wo-1', amount: 150 });
      expect(result).toEqual(invoice);
    });

    it('should reject invoice if work order is not COMPLETED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'IN_PROGRESS',
        companyId,
      });

      await expect(
        service.create(companyId, { workOrderId: 'wo-1', amount: 150 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid', async () => {
      mockPrisma.invoice.findUniqueOrThrow.mockResolvedValue({
        id: 'inv-1',
        status: 'DRAFT',
        workOrderId: 'wo-1',
        workOrder: { companyId },
      });

      const updated = { id: 'inv-1', status: 'PAID' };
      mockPrisma.$transaction.mockResolvedValue([updated, {}, {}]);

      const result = await service.markPaid(companyId, 'inv-1');
      expect(result).toEqual(updated);
    });

    it('should reject if invoice belongs to different company', async () => {
      mockPrisma.invoice.findUniqueOrThrow.mockResolvedValue({
        id: 'inv-1',
        status: 'DRAFT',
        workOrderId: 'wo-1',
        workOrder: { companyId: 'other-company' },
      });

      await expect(
        service.markPaid(companyId, 'inv-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if invoice is already PAID', async () => {
      mockPrisma.invoice.findUniqueOrThrow.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
        workOrderId: 'wo-1',
        workOrder: { companyId },
      });

      await expect(
        service.markPaid(companyId, 'inv-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should find all invoices for a company', async () => {
      const expected = [{ id: 'inv-1' }];
      mockPrisma.invoice.findMany.mockResolvedValue(expected);

      const result = await service.findAll(companyId);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should find one invoice', async () => {
      const expected = { id: 'inv-1' };
      mockPrisma.invoice.findUniqueOrThrow.mockResolvedValue(expected);

      const result = await service.findOne('inv-1');
      expect(result).toEqual(expected);
    });
  });
});
