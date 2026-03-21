import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      invoice: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      workOrder: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      workOrderStatusHistory: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('create', () => {
    it('should create invoice for completed work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.COMPLETED,
      });
      prisma.invoice.create.mockResolvedValue({ id: 'inv-1', amount: 150, workOrderId: 'wo-1' });
      prisma.workOrder.update.mockResolvedValue({});
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.create(companyId, { workOrderId: 'wo-1', amount: 150 });
      expect(result.amount).toBe(150);
    });

    it('should reject invoice for non-completed work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.IN_PROGRESS,
      });
      await expect(
        service.create(companyId, { workOrderId: 'wo-1', amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);
      await expect(
        service.create(companyId, { workOrderId: 'missing', amount: 100 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update work order status to INVOICED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1', companyId, status: WorkOrderStatus.COMPLETED,
      });
      prisma.invoice.create.mockResolvedValue({ id: 'inv-1', amount: 200, workOrderId: 'wo-1' });
      prisma.workOrder.update.mockResolvedValue({});
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      await service.create(companyId, { workOrderId: 'wo-1', amount: 200 });

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-1' },
        data: { status: WorkOrderStatus.INVOICED },
      });
    });
  });

  describe('findAll', () => {
    it('should return invoices for company', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
      const result = await service.findAll(companyId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return invoice by id', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', amount: 100 });
      const result = await service.findOne('inv-1');
      expect(result.id).toBe('inv-1');
    });

    it('should throw NotFoundException when invoice not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1', status: 'DRAFT', workOrderId: 'wo-1',
        workOrder: { customer: {} },
      });
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PAID' });
      prisma.workOrder.update.mockResolvedValue({});
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.markPaid('inv-1', 'pi_stripe123');
      expect(result.status).toBe('PAID');
    });

    it('should reject double payment', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1', status: 'PAID', workOrderId: 'wo-1',
        workOrder: { customer: {} },
      });
      await expect(service.markPaid('inv-1')).rejects.toThrow(BadRequestException);
    });
  });
});
