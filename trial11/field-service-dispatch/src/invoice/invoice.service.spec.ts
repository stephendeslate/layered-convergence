import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderService } from '../work-order/work-order.service.js';

const mockPrisma = {
  invoice: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
};

const mockWorkOrderService = {
  transition: vi.fn(),
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WorkOrderService, useValue: mockWorkOrderService },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromWorkOrder', () => {
    it('should create invoice and transition work order to INVOICED', async () => {
      mockWorkOrderService.transition.mockResolvedValue({});
      const expected = { id: 'inv-1', workOrderId: 'wo-1', amount: 150.0 };
      mockPrisma.invoice.create.mockResolvedValue(expected);

      const result = await service.createFromWorkOrder('wo-1', 'co-1', 150.0);
      expect(result).toEqual(expected);
      expect(mockWorkOrderService.transition).toHaveBeenCalledWith(
        'wo-1',
        'co-1',
        'INVOICED',
      );
    });
  });

  describe('markPaid', () => {
    it('should mark invoice as paid and transition work order to PAID', async () => {
      const invoice = {
        id: 'inv-1',
        workOrderId: 'wo-1',
        workOrder: { companyId: 'co-1' },
      };
      mockPrisma.invoice.findUnique.mockResolvedValue(invoice);
      mockWorkOrderService.transition.mockResolvedValue({});
      const updated = { ...invoice, status: 'PAID' };
      mockPrisma.invoice.update.mockResolvedValue(updated);

      const result = await service.markPaid('inv-1', 'co-1');
      expect(result.status).toBe('PAID');
      expect(mockWorkOrderService.transition).toHaveBeenCalledWith(
        'wo-1',
        'co-1',
        'PAID',
      );
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.markPaid('no', 'co')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByCompany', () => {
    it('should return invoices filtered by company', async () => {
      const expected = [{ id: 'inv-1', workOrder: { companyId: 'co-1' } }];
      mockPrisma.invoice.findMany.mockResolvedValue(expected);

      const result = await service.findAllByCompany('co-1');
      expect(result).toEqual(expected);
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
        where: { workOrder: { companyId: 'co-1' } },
        include: { workOrder: true },
      });
    });
  });
});
