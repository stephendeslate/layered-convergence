import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

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
    it('should create invoice when work order is COMPLETED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'COMPLETED',
        companyId,
      });

      const invoice = { id: 'inv-1', workOrderId: 'wo-1', amount: 150 };
      mockPrisma.$transaction.mockResolvedValue([invoice, {}, {}]);

      const result = await service.createForWorkOrder(companyId, 'wo-1', { amount: 150 });
      expect(result).toEqual(invoice);
    });

    it('should reject when work order is not COMPLETED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'IN_PROGRESS',
        companyId,
      });

      await expect(
        service.createForWorkOrder(companyId, 'wo-1', { amount: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when work order is UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'UNASSIGNED',
        companyId,
      });

      await expect(
        service.createForWorkOrder(companyId, 'wo-1', { amount: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when work order is already INVOICED', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'INVOICED',
        companyId,
      });

      await expect(
        service.createForWorkOrder(companyId, 'wo-1', { amount: 150 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should scope work order lookup by companyId', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'COMPLETED',
        companyId,
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'inv-1' }, {}, {}]);

      await service.createForWorkOrder(companyId, 'wo-1', { amount: 150 });
      expect(mockPrisma.workOrder.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 'wo-1', companyId },
      });
    });

    it('should transition work order to INVOICED status', async () => {
      mockPrisma.workOrder.findFirstOrThrow.mockResolvedValue({
        id: 'wo-1',
        status: 'COMPLETED',
        companyId,
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'inv-1' }, {}, {}]);

      await service.createForWorkOrder(companyId, 'wo-1', { amount: 150 });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return invoices scoped by company', async () => {
      const expected = [{ id: 'inv-1' }];
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
    it('should return invoice with work order included', async () => {
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
