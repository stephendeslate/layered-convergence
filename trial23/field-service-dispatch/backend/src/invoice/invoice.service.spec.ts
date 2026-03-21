import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    invoice: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      invoice: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  describe('findAll', () => {
    it('should return all invoices for company', async () => {
      const invoices = [{ id: '1', invoiceNumber: 'INV-001', companyId: 'c1' }];
      prisma.invoice.findMany.mockResolvedValue(invoices);

      const result = await service.findAll('c1');
      expect(result).toEqual(invoices);
    });
  });

  describe('findOne', () => {
    it('should return an invoice', async () => {
      const invoice = { id: '1', invoiceNumber: 'INV-001', companyId: 'c1' };
      prisma.invoice.findFirst.mockResolvedValue(invoice);

      const result = await service.findOne('1', 'c1');
      expect(result).toEqual(invoice);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an invoice with DRAFT status', async () => {
      const data = {
        invoiceNumber: 'INV-001',
        amount: 100,
        taxAmount: 10,
        totalAmount: 110,
        workOrderId: 'wo-1',
        customerId: 'cust-1',
        companyId: 'c1',
      };

      prisma.invoice.create.mockResolvedValue({ id: '1', ...data, status: 'DRAFT' });

      const result = await service.create(data);
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('transition', () => {
    it('should allow DRAFT -> SENT', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', companyId: 'c1' });
      prisma.invoice.update.mockResolvedValue({ id: '1', status: 'SENT' });

      const result = await service.transition('1', 'c1', 'SENT' as never);
      expect(result.status).toBe('SENT');
    });

    it('should allow SENT -> PAID', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'SENT', companyId: 'c1' });
      prisma.invoice.update.mockResolvedValue({ id: '1', status: 'PAID' });

      const result = await service.transition('1', 'c1', 'PAID' as never);
      expect(result.status).toBe('PAID');
    });

    it('should allow DRAFT -> VOID', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', companyId: 'c1' });
      prisma.invoice.update.mockResolvedValue({ id: '1', status: 'VOID' });

      const result = await service.transition('1', 'c1', 'VOID' as never);
      expect(result.status).toBe('VOID');
    });

    it('should reject DRAFT -> PAID (invalid)', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', companyId: 'c1' });

      await expect(
        service.transition('1', 'c1', 'PAID' as never),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject VOID -> DRAFT (invalid)', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'VOID', companyId: 'c1' });

      await expect(
        service.transition('1', 'c1', 'DRAFT' as never),
      ).rejects.toThrow(ConflictException);
    });
  });
});
