import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  workOrder: {
    findFirst: vi.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice for a completed work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'COMPLETED',
        companyId: 'comp-1',
      });
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        amount: 250,
        status: 'DRAFT',
      });
      mockPrisma.workOrder.update.mockResolvedValue({});
      mockPrisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.create('comp-1', {
        workOrderId: 'wo-1',
        amount: 250,
      });
      expect(result.amount).toBe(250);
    });

    it('should throw NotFoundException for missing work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(
        service.create('comp-1', { workOrderId: 'bad', amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-completed work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'ASSIGNED',
      });
      await expect(
        service.create('comp-1', { workOrderId: 'wo-1', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return invoices for company', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1' });
      const result = await service.findOne('inv-1');
      expect(result.id).toBe('inv-1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsSent', () => {
    it('should mark a draft invoice as sent', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'DRAFT',
      });
      mockPrisma.invoice.update.mockResolvedValue({
        id: 'inv-1',
        status: 'SENT',
      });
      const result = await service.markAsSent('inv-1');
      expect(result.status).toBe('SENT');
    });

    it('should throw BadRequestException for non-draft invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
      });
      await expect(service.markAsSent('inv-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markAsPaid', () => {
    it('should mark a sent invoice as paid', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'SENT',
        workOrderId: 'wo-1',
      });
      mockPrisma.$transaction.mockResolvedValue([
        { id: 'inv-1', status: 'PAID' },
        {},
        {},
      ]);
      const result = await service.markAsPaid('inv-1');
      expect(result.status).toBe('PAID');
    });
  });

  describe('voidInvoice', () => {
    it('should void a draft invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'DRAFT',
      });
      mockPrisma.invoice.update.mockResolvedValue({
        id: 'inv-1',
        status: 'VOID',
      });
      const result = await service.voidInvoice('inv-1');
      expect(result.status).toBe('VOID');
    });

    it('should throw BadRequestException for paid invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
      });
      await expect(service.voidInvoice('inv-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
