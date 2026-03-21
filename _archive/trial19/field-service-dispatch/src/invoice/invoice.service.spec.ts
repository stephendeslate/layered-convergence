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
    it('should transition work order to INVOICED and create invoice', async () => {
      mockWorkOrderService.transition.mockResolvedValue({
        id: 'wo-1',
        status: 'INVOICED',
      });
      const expected = { id: 'inv-1', workOrderId: 'wo-1', amount: 250 };
      mockPrisma.invoice.create.mockResolvedValue(expected);

      const result = await service.createFromWorkOrder('wo-1', 'co-1', 250);
      expect(result).toEqual(expected);
      expect(mockWorkOrderService.transition).toHaveBeenCalledWith(
        'wo-1',
        'co-1',
        'INVOICED',
      );
    });

    it('should propagate transition errors', async () => {
      mockWorkOrderService.transition.mockRejectedValue(
        new Error('Invalid transition'),
      );

      await expect(
        service.createFromWorkOrder('wo-1', 'co-1', 250),
      ).rejects.toThrow('Invalid transition');
    });
  });

  describe('markPaid', () => {
    it('should transition work order to PAID and update invoice', async () => {
      const invoice = {
        id: 'inv-1',
        workOrderId: 'wo-1',
        workOrder: { id: 'wo-1', companyId: 'co-1' },
      };
      mockPrisma.invoice.findUnique.mockResolvedValue(invoice);
      mockWorkOrderService.transition.mockResolvedValue({
        id: 'wo-1',
        status: 'PAID',
      });
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

      await expect(service.markPaid('no', 'co-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllByCompany', () => {
    it('should return invoices for a company', async () => {
      const expected = [
        { id: 'inv-1', workOrder: { companyId: 'co-1' } },
      ];
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
