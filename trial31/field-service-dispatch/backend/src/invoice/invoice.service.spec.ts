import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma.service';

describe('InvoiceService', () => {
  let service: InvoiceService;

  const mockPrisma = {
    invoice: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByCompany', () => {
    it('should return invoices for a company', async () => {
      const invoices = [{ id: 'inv1', amount: 850, status: 'DRAFT' }];
      mockPrisma.invoice.findMany.mockResolvedValue(invoices);

      const result = await service.findAllByCompany('company-1');
      expect(result).toEqual(invoices);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('should allow DRAFT -> SENT transition', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv1',
        status: 'DRAFT',
      });
      mockPrisma.invoice.update.mockResolvedValue({
        id: 'inv1',
        status: 'SENT',
      });

      const result = await service.transitionStatus('inv1', 'SENT');
      expect(result.status).toBe('SENT');
    });

    it('should allow SENT -> PAID and set paidAt', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv1',
        status: 'SENT',
      });
      mockPrisma.invoice.update.mockResolvedValue({
        id: 'inv1',
        status: 'PAID',
        paidAt: new Date(),
      });

      const result = await service.transitionStatus('inv1', 'PAID');
      expect(result.status).toBe('PAID');
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PAID',
            paidAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should reject invalid transition PAID -> DRAFT', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv1',
        status: 'PAID',
      });

      await expect(
        service.transitionStatus('inv1', 'DRAFT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.transitionStatus('missing', 'SENT'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('totalRevenueByCompany', () => {
    it('should return total from raw query', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ total: 2050.00 }]);

      const result = await service.totalRevenueByCompany('company-1');
      expect(result).toBe(2050);
    });

    it('should return 0 when no paid invoices', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ total: null }]);

      const result = await service.totalRevenueByCompany('company-1');
      expect(result).toBe(0);
    });
  });
});
