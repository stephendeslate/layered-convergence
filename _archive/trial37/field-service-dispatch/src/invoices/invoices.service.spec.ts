import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus, InvoiceStatus } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      invoice: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
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

  it('should create an invoice for a completed work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.COMPLETED,
    });
    prisma.invoice.create.mockResolvedValue({ id: 'inv1', workOrderId: 'wo1', amount: 150 });
    prisma.workOrder.update.mockResolvedValue({});
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    const result = await service.create(companyId, { workOrderId: 'wo1', amount: 150 });
    expect(result.id).toBe('inv1');
    expect(result.amount).toBe(150);
  });

  it('should throw NotFoundException if work order not found', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);
    await expect(
      service.create(companyId, { workOrderId: 'missing', amount: 100 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if work order not completed', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.IN_PROGRESS,
    });
    await expect(
      service.create(companyId, { workOrderId: 'wo1', amount: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should update work order status to INVOICED on create', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo1', companyId, status: WorkOrderStatus.COMPLETED,
    });
    prisma.invoice.create.mockResolvedValue({ id: 'inv1', workOrderId: 'wo1', amount: 100 });
    prisma.workOrder.update.mockResolvedValue({});
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    await service.create(companyId, { workOrderId: 'wo1', amount: 100 });
    expect(prisma.workOrder.update).toHaveBeenCalledWith({
      where: { id: 'wo1' },
      data: { status: WorkOrderStatus.INVOICED },
    });
  });

  it('should find all invoices for company', async () => {
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv1' }]);
    const result = await service.findAll(companyId);
    expect(result).toHaveLength(1);
  });

  it('should find one invoice', async () => {
    prisma.invoice.findUnique.mockResolvedValue({ id: 'inv1', workOrderId: 'wo1' });
    const result = await service.findOne('inv1');
    expect(result.id).toBe('inv1');
  });

  it('should throw NotFoundException for missing invoice', async () => {
    prisma.invoice.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should mark invoice as paid', async () => {
    prisma.invoice.findUnique.mockResolvedValue({
      id: 'inv1', workOrderId: 'wo1', status: InvoiceStatus.PENDING,
    });
    prisma.invoice.update.mockResolvedValue({
      id: 'inv1', status: InvoiceStatus.PAID, stripePaymentIntentId: 'pi_123',
    });
    prisma.workOrder.update.mockResolvedValue({});
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    const result = await service.markPaid('inv1', 'pi_123');
    expect(result.status).toBe(InvoiceStatus.PAID);
  });

  it('should throw if invoice already paid', async () => {
    prisma.invoice.findUnique.mockResolvedValue({
      id: 'inv1', workOrderId: 'wo1', status: InvoiceStatus.PAID,
    });
    await expect(service.markPaid('inv1')).rejects.toThrow(BadRequestException);
  });

  it('should update work order to PAID when invoice paid', async () => {
    prisma.invoice.findUnique.mockResolvedValue({
      id: 'inv1', workOrderId: 'wo1', status: InvoiceStatus.PENDING,
    });
    prisma.invoice.update.mockResolvedValue({ id: 'inv1', status: InvoiceStatus.PAID });
    prisma.workOrder.update.mockResolvedValue({});
    prisma.workOrderStatusHistory.create.mockResolvedValue({});

    await service.markPaid('inv1');
    expect(prisma.workOrder.update).toHaveBeenCalledWith({
      where: { id: 'wo1' },
      data: { status: WorkOrderStatus.PAID },
    });
  });
});
