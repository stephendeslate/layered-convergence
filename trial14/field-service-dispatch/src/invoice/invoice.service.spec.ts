import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const WorkOrderStatus = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  EN_ROUTE: 'EN_ROUTE',
  ON_SITE: 'ON_SITE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  INVOICED: 'INVOICED',
  PAID: 'PAID',
} as const;

const mockPrisma = {
  workOrder: {
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
  },
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
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

  describe('createForWorkOrder', () => {
    it('should create invoice for a COMPLETED work order', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
      });
      const invoiceResult = { id: 'inv-1', workOrderId: 'wo-1', amount: 100 };
      mockPrisma.$transaction.mockResolvedValue([invoiceResult]);

      const result = await service.createForWorkOrder(companyId, 'wo-1', { amount: 100 });
      expect(result).toEqual(invoiceResult);
    });

    it('should scope work order lookup by companyId', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'inv-1' }]);

      await service.createForWorkOrder(companyId, 'wo-1', { amount: 100 });
      expect(mockPrisma.workOrder.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 'wo-1', companyId },
      });
    });

    it('should throw BadRequestException if work order is not COMPLETED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ASSIGNED,
      });

      await expect(
        service.createForWorkOrder(companyId, 'wo-1', { amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for UNASSIGNED work order', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.UNASSIGNED,
      });

      await expect(
        service.createForWorkOrder(companyId, 'wo-1', { amount: 100 }),
      ).rejects.toThrow('Work order must be COMPLETED to create invoice');
    });

    it('should throw BadRequestException for IN_PROGRESS work order', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
      });

      await expect(
        service.createForWorkOrder(companyId, 'wo-1', { amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for INVOICED work order', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.INVOICED,
      });

      await expect(
        service.createForWorkOrder(companyId, 'wo-1', { amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use $transaction for atomicity', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'inv-1' }]);

      await service.createForWorkOrder(companyId, 'wo-1', { amount: 250 });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should return the first element from transaction (the invoice)', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
      });
      const invoice = { id: 'inv-1', workOrderId: 'wo-1', amount: 500 };
      mockPrisma.$transaction.mockResolvedValue([invoice, {}, {}]);

      const result = await service.createForWorkOrder(companyId, 'wo-1', { amount: 500 });
      expect(result).toEqual(invoice);
    });
  });

  describe('findAll', () => {
    it('should return invoices scoped by companyId through workOrder relation', async () => {
      const expected = [{ id: 'inv-1', workOrder: { companyId } }];
      mockPrisma.invoice.findMany.mockResolvedValue(expected);

      const result = await service.findAll(companyId);
      expect(result).toEqual(expected);
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
        where: { workOrder: { companyId } },
        include: { workOrder: true },
      });
    });

    it('should return empty array when no invoices', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single invoice by id with workOrder included', async () => {
      const expected = { id: 'inv-1', workOrder: { id: 'wo-1' } };
      mockPrisma.invoice.findUniqueOrThrow.mockResolvedValue(expected);

      const result = await service.findOne('inv-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.invoice.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        include: { workOrder: true },
      });
    });
  });
});
