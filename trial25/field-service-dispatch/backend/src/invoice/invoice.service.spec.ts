// [TRACED:TS-004] Unit test for InvoiceService — state machine transitions
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
  let tenantContext: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      invoice: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    tenantContext = {
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException when invoice not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('inv-1', 'user-1', 'company-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid transition DRAFT -> SENT', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        status: 'DRAFT',
      });
      prisma.invoice.update.mockResolvedValue({
        id: 'inv-1',
        status: 'SENT',
      });

      const result = await service.updateStatus(
        'inv-1',
        'SENT' as never,
        'user-1',
        'company-1',
      );
      expect(result.status).toBe('SENT');
    });

    it('should allow transition SENT -> PAID', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        status: 'SENT',
      });
      prisma.invoice.update.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
      });

      const result = await service.updateStatus(
        'inv-1',
        'PAID' as never,
        'user-1',
        'company-1',
      );
      expect(result.status).toBe('PAID');
    });

    it('should reject invalid transition DRAFT -> PAID', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        status: 'DRAFT',
      });

      await expect(
        service.updateStatus(
          'inv-1',
          'PAID' as never,
          'user-1',
          'company-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from terminal state PAID', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
      });

      await expect(
        service.updateStatus(
          'inv-1',
          'OVERDUE' as never,
          'user-1',
          'company-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
