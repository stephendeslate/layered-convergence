import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      invoice: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new InvoicesService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create an invoice', async () => {
      const dto = { workOrderId: 'wo-1', amount: 150.0 };
      prisma.invoice.create.mockResolvedValue({
        id: 'inv-1', status: 'DRAFT', ...dto,
      });

      const result = await service.create(dto as any);
      expect(result.status).toBe('DRAFT');
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ workOrderId: 'wo-1', amount: 150.0, status: 'DRAFT' }),
        include: { workOrder: true },
      });
    });

    it('should use provided status', async () => {
      const dto = { workOrderId: 'wo-1', amount: 150.0, status: 'SENT' };
      prisma.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await service.create(dto as any);
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'SENT' }),
        include: { workOrder: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return all invoices', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an invoice by id', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1' });
      const result = await service.findOne('inv-1');
      expect(result.id).toBe('inv-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByWorkOrder', () => {
    it('should return invoice for a work order', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', workOrderId: 'wo-1' });
      const result = await service.findByWorkOrder('wo-1');
      expect(result!.workOrderId).toBe('wo-1');
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1' });
      prisma.invoice.update.mockResolvedValue({
        id: 'inv-1', status: 'PAID', stripePaymentIntentId: 'pi_123',
      });

      const result = await service.markPaid('inv-1', 'pi_123');
      expect(result.status).toBe('PAID');
      expect(result.stripePaymentIntentId).toBe('pi_123');
    });

    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.markPaid('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1' });
      prisma.invoice.delete.mockResolvedValue({ id: 'inv-1' });

      const result = await service.delete('inv-1');
      expect(result.id).toBe('inv-1');
    });
  });
});
