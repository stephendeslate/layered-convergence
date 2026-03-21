import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: any;
  let audit: any;

  const COMPANY_ID = 'company-1';
  const USER_ID = 'user-1';

  function makeLineItem(overrides: Record<string, any> = {}) {
    return {
      id: 'li-1',
      description: 'AC Repair Labor',
      type: 'LABOR',
      quantity: 2,
      unitPrice: 75.0,
      totalPrice: 150.0,
      sortOrder: 0,
      ...overrides,
    };
  }

  function makeWorkOrder(overrides: Record<string, any> = {}) {
    return {
      id: 'wo-1',
      companyId: COMPANY_ID,
      customerId: 'cust-1',
      status: 'COMPLETED',
      lineItems: [makeLineItem()],
      invoice: null,
      ...overrides,
    };
  }

  function makeInvoice(overrides: Record<string, any> = {}) {
    return {
      id: 'inv-1',
      companyId: COMPANY_ID,
      customerId: 'cust-1',
      workOrderId: 'wo-1',
      invoiceNumber: 'INV-00001',
      status: 'DRAFT',
      subtotal: 150.0,
      taxAmount: 15.0,
      totalAmount: 165.0,
      dueDate: new Date('2026-04-19'),
      paidAt: null,
      notes: null,
      lineItems: [makeLineItem()],
      customer: { id: 'cust-1', name: 'Test Customer' },
      workOrder: { id: 'wo-1' },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
      },
      company: {
        findUnique: vi.fn().mockResolvedValue({ taxRate: 0.10 }),
      },
      invoice: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  describe('generate', () => {
    it('should generate invoice from work order line items', async () => {
      const wo = makeWorkOrder({
        lineItems: [
          makeLineItem({ id: 'li-1', totalPrice: 150.0 }),
          makeLineItem({ id: 'li-2', description: 'Parts', type: 'MATERIAL', totalPrice: 50.0 }),
        ],
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      const invoice = makeInvoice({
        subtotal: 200.0,
        taxAmount: 20.0,
        totalAmount: 220.0,
      });
      prisma.invoice.create.mockResolvedValue(invoice);

      const result = await service.generate(COMPANY_ID, 'wo-1', USER_ID);

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: COMPANY_ID,
            customerId: 'cust-1',
            workOrderId: 'wo-1',
            subtotal: 200.0,
            taxAmount: 20.0,
            totalAmount: 220.0,
            status: 'DRAFT',
          }),
        }),
      );
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'invoice.generate',
      }));
    });

    it('should use company tax rate for tax calculation', async () => {
      const wo = makeWorkOrder({
        lineItems: [makeLineItem({ totalPrice: 100.0 })],
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.company.findUnique.mockResolvedValue({ taxRate: 0.085 }); // 8.5%
      prisma.invoice.create.mockResolvedValue(makeInvoice());

      await service.generate(COMPANY_ID, 'wo-1');

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 100.0,
            taxAmount: 8.5,
            totalAmount: 108.5,
          }),
        }),
      );
    });

    it('should generate sequential invoice numbers', async () => {
      prisma.invoice.count.mockResolvedValue(5); // 5 existing invoices
      const wo = makeWorkOrder();
      prisma.workOrder.findFirst.mockResolvedValue(wo);
      prisma.invoice.create.mockResolvedValue(makeInvoice({ invoiceNumber: 'INV-00006' }));

      await service.generate(COMPANY_ID, 'wo-1');

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceNumber: 'INV-00006',
          }),
        }),
      );
    });

    it('should throw if work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.generate(COMPANY_ID, 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw if invoice already exists', async () => {
      const wo = makeWorkOrder({ invoice: { id: 'existing-inv' } });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(service.generate(COMPANY_ID, 'wo-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if no line items', async () => {
      const wo = makeWorkOrder({ lineItems: [] });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(service.generate(COMPANY_ID, 'wo-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('get', () => {
    it('should return invoice with line items', async () => {
      prisma.invoice.findFirst.mockResolvedValue(makeInvoice());

      const result = await service.get(COMPANY_ID, 'inv-1');

      expect(result.id).toBe('inv-1');
      expect(result.lineItems).toHaveLength(1);
    });

    it('should throw NotFoundException for missing invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.get(COMPANY_ID, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return paginated list', async () => {
      prisma.invoice.findMany.mockResolvedValue([makeInvoice()]);
      prisma.invoice.count.mockResolvedValue(1);

      const result = await service.list(COMPANY_ID, { page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.list(COMPANY_ID, { status: 'PAID' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PAID' }),
        }),
      );
    });

    it('should filter by customerId', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.list(COMPANY_ID, { customerId: 'cust-1' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ customerId: 'cust-1' }),
        }),
      );
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue(makeInvoice({ status: 'SENT' }));
      prisma.invoice.update.mockResolvedValue(makeInvoice({ status: 'PAID', paidAt: new Date() }));

      const result = await service.markPaid(COMPANY_ID, 'inv-1', undefined, USER_ID);

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'invoice.mark_paid',
      }));
    });

    it('should throw if invoice already paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue(makeInvoice({ status: 'PAID' }));

      await expect(service.markPaid(COMPANY_ID, 'inv-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update draft invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(makeInvoice({ status: 'DRAFT' }));
      prisma.invoice.update.mockResolvedValue(makeInvoice({ notes: 'Updated notes' }));

      await service.update(COMPANY_ID, 'inv-1', { notes: 'Updated notes' }, USER_ID);

      expect(prisma.invoice.update).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalled();
    });

    it('should reject update of non-draft invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(makeInvoice({ status: 'SENT' }));

      await expect(
        service.update(COMPANY_ID, 'inv-1', { notes: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if invoice not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.update(COMPANY_ID, 'missing', { notes: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
