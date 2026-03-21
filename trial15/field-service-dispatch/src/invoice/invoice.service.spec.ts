import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  workOrder: {
    findFirst: vi.fn(),
  },
};

const COMPANY_ID = 'company-1';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice for a completed work order', async () => {
      const dto = { amount: 150.0, workOrderId: 'wo-1', description: 'Pipe repair' };
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: 'COMPLETED' });
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv-1', ...dto, companyId: COMPANY_ID });

      const result = await service.create(COMPANY_ID, dto);
      expect(result.id).toBe('inv-1');
      expect(result.amount).toBe(150.0);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.create(COMPANY_ID, { amount: 100, workOrderId: 'bad' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when work order is not COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: 'CREATED' });

      await expect(
        service.create(COMPANY_ID, { amount: 100, workOrderId: 'wo-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include work order in response', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', status: 'COMPLETED' });
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await service.create(COMPANY_ID, { amount: 100, workOrderId: 'wo-1' });
      expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { workOrder: true },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all invoices for company', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
      const result = await service.findAll(COMPANY_ID);
      expect(result).toHaveLength(1);
    });

    it('should scope by companyId', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);
      await service.findAll(COMPANY_ID);
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId: COMPANY_ID } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an invoice by id', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1' });
      const result = await service.findOne('inv-1', COMPANY_ID);
      expect(result.id).toBe('inv-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });

    it('should scope by companyId', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1' });
      await service.findOne('inv-1', COMPANY_ID);
      expect(mockPrisma.invoice.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1', companyId: COMPANY_ID },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update an invoice', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1' });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv-1', amount: 200 });

      const result = await service.update('inv-1', COMPANY_ID, { amount: 200 });
      expect(result.amount).toBe(200);
    });

    it('should throw if invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      await expect(service.update('bad', COMPANY_ID, { amount: 200 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an invoice', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1' });
      mockPrisma.invoice.delete.mockResolvedValue({ id: 'inv-1' });

      const result = await service.remove('inv-1', COMPANY_ID);
      expect(result.id).toBe('inv-1');
    });

    it('should throw if invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markPaid', () => {
    it('should mark an invoice as paid', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', paidAt: null });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv-1', paidAt: new Date() });

      const result = await service.markPaid('inv-1', COMPANY_ID);
      expect(result.paidAt).toBeDefined();
    });

    it('should throw BadRequestException if already paid', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', paidAt: new Date() });

      await expect(service.markPaid('inv-1', COMPANY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      await expect(service.markPaid('bad', COMPANY_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByWorkOrder', () => {
    it('should return invoices for a work order', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', workOrderId: 'wo-1' }]);

      const result = await service.findByWorkOrder('wo-1', COMPANY_ID);
      expect(result).toHaveLength(1);
    });

    it('should scope by companyId', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);
      await service.findByWorkOrder('wo-1', COMPANY_ID);
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workOrderId: 'wo-1', companyId: COMPANY_ID },
        }),
      );
    });
  });
});
