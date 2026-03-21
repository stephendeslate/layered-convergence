import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    invoice: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      invoice: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new InvoiceService(prisma as unknown as PrismaService);
  });

  it('should find all invoices for a company', async () => {
    prisma.invoice.findMany.mockResolvedValue([]);
    const result = await service.findAll('company-1');
    expect(result).toEqual([]);
  });

  it('should throw NotFoundException if invoice not found', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);
    await expect(service.findById('inv-1', 'company-1')).rejects.toThrow(NotFoundException);
  });

  it('should create an invoice with calculated total', async () => {
    const dto = { amount: '100.00', tax: '8.50', workOrderId: 'wo-1' };
    prisma.invoice.create.mockResolvedValue({
      id: 'inv-1',
      amount: '100.00',
      tax: '8.50',
      total: '108.50',
      workOrderId: 'wo-1',
      companyId: 'company-1',
    });
    const result = await service.create(dto, 'company-1');
    expect(result.total).toBe('108.50');
  });
});
