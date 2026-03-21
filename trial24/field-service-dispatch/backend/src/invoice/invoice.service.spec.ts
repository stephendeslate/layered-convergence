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
    it('should return invoices for a company', async () => {
      const mockInvoices = [{ id: '1', invoiceNumber: 'INV-001' }];
      prisma.invoice.findMany.mockResolvedValue(mockInvoices);

      const result = await service.findAll('c-1');
      expect(result).toEqual(mockInvoices);
    });
  });

  describe('findOne', () => {
    it('should return an invoice by id and company', async () => {
      const mockInvoice = { id: '1', companyId: 'c-1' };
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      const result = await service.findOne('1', 'c-1');
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad', 'c-1')).rejects.toThrow(NotFoundException);
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
        companyId: 'c-1',
      };

      prisma.invoice.create.mockResolvedValue({ id: '1', ...data, status: 'DRAFT' });

      const result = await service.create(data);
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('transition', () => {
    it('should allow DRAFT -> SENT transition', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', companyId: 'c-1' });
      prisma.invoice.update.mockResolvedValue({ id: '1', status: 'SENT' });

      const result = await service.transition('1', 'c-1', 'SENT' as 'SENT');
      expect(result.status).toBe('SENT');
    });

    it('should reject invalid transitions', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'VOID', companyId: 'c-1' });

      await expect(
        service.transition('1', 'c-1', 'DRAFT' as 'DRAFT'),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow SENT -> PAID transition', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: '1', status: 'SENT', companyId: 'c-1' });
      prisma.invoice.update.mockResolvedValue({ id: '1', status: 'PAID' });

      const result = await service.transition('1', 'c-1', 'PAID' as 'PAID');
      expect(result.status).toBe('PAID');
    });
  });
});
