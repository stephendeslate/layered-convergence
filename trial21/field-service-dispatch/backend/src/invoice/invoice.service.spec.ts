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
    companyContext = { setCompanyContext: jest.fn().mockResolvedValue(undefined) };

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

  describe('create', () => {
    it('should compute total as amount + tax using Decimal', async () => {
      prisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        amount: '100.00',
        tax: '8.50',
        total: '108.50',
      });

      const result = await service.create(
        { workOrderId: 'wo-1', amount: 100, tax: 8.5 },
        'c1',
      );

      expect(result.total).toBe('108.50');
      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'c1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('missing', 'c1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an existing invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', companyId: 'c1' });
      prisma.invoice.delete.mockResolvedValue({ id: 'inv-1' });

      const result = await service.remove('inv-1', 'c1');
      expect(result.id).toBe('inv-1');
    });

    it('should throw NotFoundException for missing invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('missing', 'c1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
