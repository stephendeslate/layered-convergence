import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  invoice: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invoice', async () => {
      mockPrismaService.invoice.create.mockResolvedValue({
        id: '1', amount: 500.00, currency: 'USD', paidAt: null,
      });

      const result = await service.create({
        amount: 500.00, currency: 'USD', workOrderId: 'wo1',
        customerId: 'c1', companyId: 'company-1',
      });

      expect(result.paidAt).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when invoice not found', async () => {
      mockPrismaService.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'company-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markPaid', () => {
    it('should update paidAt timestamp', async () => {
      const now = new Date();
      mockPrismaService.invoice.findFirst.mockResolvedValue({ id: '1', companyId: 'company-1' });
      mockPrismaService.invoice.update.mockResolvedValue({ id: '1', paidAt: now });

      const result = await service.markPaid('1', 'company-1');

      expect(result.paidAt).toBeDefined();
    });
  });
});
