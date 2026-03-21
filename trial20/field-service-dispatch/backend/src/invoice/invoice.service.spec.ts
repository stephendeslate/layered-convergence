import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    invoice: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let companyContext: { setCompanyContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      invoice: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    companyContext = { setCompanyContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyContextService, useValue: companyContext },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all invoices', async () => {
      const invoices = [{ id: '1', amount: '100.00', companyId: 'c1' }];
      prisma.invoice.findMany.mockResolvedValue(invoices);

      const result = await service.findAll('c1');
      expect(result).toEqual(invoices);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an invoice with calculated total', async () => {
      const dto = { workOrderId: 'wo1', amount: 100, tax: 10 };
      prisma.invoice.create.mockImplementation(({ data }) => {
        return Promise.resolve({
          id: '1',
          ...data,
        });
      });

      const result = await service.create(dto, 'c1');
      expect(result.companyId).toBe('c1');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
