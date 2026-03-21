import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(InvoicesService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invoice', async () => {
      const dto = { workOrderId: 'wo-1', amount: 100 };
      mockPrisma.invoice.create.mockResolvedValue({ id: '1', ...dto, status: 'DRAFT' });
      const result = await service.create(dto);
      expect(result.amount).toBe(100);
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('findAll', () => {
    it('should return all invoices', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return invoice when found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: '1' });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByWorkOrder', () => {
    it('should return invoice for work order', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: '1', workOrderId: 'wo-1' });
      const result = await service.findByWorkOrder('wo-1');
      expect(result?.workOrderId).toBe('wo-1');
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.invoice.update.mockResolvedValue({ id: '1', status: 'PAID' });
      const result = await service.markPaid('1', 'pi_123');
      expect(result.status).toBe('PAID');
    });
  });

  describe('delete', () => {
    it('should delete invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.invoice.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('1');
      expect(result.id).toBe('1');
    });
  });
});
