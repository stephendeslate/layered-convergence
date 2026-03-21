import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    workOrder: { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    invoice: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const companyId = 'company-1';

  const mockInvoice = {
    id: 'inv-1',
    number: 'INV-001',
    amount: 150,
    tax: 15,
    total: 165,
    notes: null,
    workOrderId: 'wo-1',
    companyId,
    workOrder: { id: 'wo-1', title: 'Fix AC' },
  };

  beforeEach(() => {
    prisma = {
      workOrder: { findFirst: vi.fn(), update: vi.fn() },
      invoice: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };
    service = new InvoiceService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create an invoice for a completed work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
        companyId,
      });
      prisma.invoice.create.mockResolvedValue(mockInvoice);
      prisma.workOrder.update.mockResolvedValue({});

      const result = await service.create(companyId, {
        workOrderId: 'wo-1',
        number: 'INV-001',
        amount: 150,
        tax: 15,
      });

      expect(result.amount).toBe(150);
      expect(result.total).toBe(165);
    });

    it('should calculate total from amount + tax', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
        companyId,
      });
      prisma.invoice.create.mockResolvedValue(mockInvoice);
      prisma.workOrder.update.mockResolvedValue({});

      await service.create(companyId, {
        workOrderId: 'wo-1',
        number: 'INV-001',
        amount: 100,
        tax: 10,
      });

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 100,
            tax: 10,
            total: 110,
          }),
        }),
      );
    });

    it('should default tax to 0', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
        companyId,
      });
      prisma.invoice.create.mockResolvedValue({ ...mockInvoice, tax: 0, total: 150 });
      prisma.workOrder.update.mockResolvedValue({});

      await service.create(companyId, {
        workOrderId: 'wo-1',
        number: 'INV-001',
        amount: 150,
      });

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tax: 0, total: 150 }),
        }),
      );
    });

    it('should transition work order to INVOICED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.COMPLETED,
        companyId,
      });
      prisma.invoice.create.mockResolvedValue(mockInvoice);
      prisma.workOrder.update.mockResolvedValue({});

      await service.create(companyId, {
        workOrderId: 'wo-1',
        number: 'INV-001',
        amount: 150,
      });

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: { status: WorkOrderStatus.INVOICED },
      });
    });

    it('should throw NotFoundException if work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.create(companyId, { workOrderId: 'bad', number: 'INV-001', amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if work order not completed', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.CREATED,
      });

      await expect(
        service.create(companyId, { workOrderId: 'wo-1', number: 'INV-001', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if work order is IN_PROGRESS', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.IN_PROGRESS,
      });

      await expect(
        service.create(companyId, { workOrderId: 'wo-1', number: 'INV-001', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if work order is ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: WorkOrderStatus.ASSIGNED,
      });

      await expect(
        service.create(companyId, { workOrderId: 'wo-1', number: 'INV-001', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all invoices for company', async () => {
      prisma.invoice.findMany.mockResolvedValue([mockInvoice]);

      const result = await service.findAll(companyId);

      expect(result).toHaveLength(1);
      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId },
        }),
      );
    });

    it('should return empty array when no invoices', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });

    it('should include work order relation', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);

      await service.findAll(companyId);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { workOrder: true },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return an invoice with relations', async () => {
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      const result = await service.findById(companyId, 'inv-1');
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findById(companyId, 'bad')).rejects.toThrow(NotFoundException);
    });

    it('should filter by companyId for tenant isolation', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findById('other-company', 'inv-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
