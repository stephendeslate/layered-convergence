import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceStatus, WorkOrderStatus } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  workOrder: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  workOrderStatusHistory: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('create', () => {
    it('should create invoice for completed work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.COMPLETED,
      });
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv1', amount: 100 });
      mockPrisma.workOrder.update.mockResolvedValue({});
      mockPrisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.create('comp1', { workOrderId: 'wo1', amount: 100 });
      expect(result.amount).toBe(100);
    });

    it('should throw NotFoundException if work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(
        service.create('comp1', { workOrderId: 'wo999', amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if work order not completed', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1',
        status: WorkOrderStatus.ASSIGNED,
      });
      await expect(
        service.create('comp1', { workOrderId: 'wo1', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all invoices for company', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'inv1' }]);
      const result = await service.findAll('comp1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return invoice when found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv1' });
      const result = await service.findOne('inv1');
      expect(result.id).toBe('inv1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.findOne('inv999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsSent', () => {
    it('should mark draft invoice as sent', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.DRAFT });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.SENT });
      const result = await service.markAsSent('inv1');
      expect(result.status).toBe(InvoiceStatus.SENT);
    });

    it('should throw if invoice is not draft', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.PAID });
      await expect(service.markAsSent('inv1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('markAsPaid', () => {
    it('should mark sent invoice as paid', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv1',
        status: InvoiceStatus.SENT,
        workOrderId: 'wo1',
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 'inv1', status: InvoiceStatus.PAID }, {}, {}]);
      const result = await service.markAsPaid('inv1');
      expect(result.status).toBe(InvoiceStatus.PAID);
    });

    it('should throw if invoice is already paid', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.PAID });
      await expect(service.markAsPaid('inv1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('voidInvoice', () => {
    it('should void a draft invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.DRAFT });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.VOID });
      const result = await service.voidInvoice('inv1');
      expect(result.status).toBe(InvoiceStatus.VOID);
    });

    it('should throw if invoice is paid', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.PAID });
      await expect(service.voidInvoice('inv1')).rejects.toThrow(BadRequestException);
    });
  });
});
