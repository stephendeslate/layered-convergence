import { NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';

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

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InvoiceService(mockPrisma as any, mockWorkOrderService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromWorkOrder', () => {
    it('should transition work order and create invoice', async () => {
      mockWorkOrderService.transition.mockResolvedValue({});
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv1', amount: 100 });

      const result = await service.createFromWorkOrder('wo1', 'c1', 100);

      expect(mockWorkOrderService.transition).toHaveBeenCalledWith(
        'wo1',
        'c1',
        'INVOICED',
      );
      expect(result).toEqual({ id: 'inv1', amount: 100 });
    });

    it('should create invoice with correct data', async () => {
      mockWorkOrderService.transition.mockResolvedValue({});
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv1' });

      await service.createFromWorkOrder('wo1', 'c1', 250);

      expect(mockPrisma.invoice.create).toHaveBeenCalledWith({
        data: { workOrderId: 'wo1', amount: 250 },
      });
    });
  });

  describe('markPaid', () => {
    it('should transition work order and update invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: 'inv1',
        workOrderId: 'wo1',
        workOrder: { companyId: 'c1' },
      });
      mockWorkOrderService.transition.mockResolvedValue({});
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv1', status: 'PAID' });

      const result = await service.markPaid('inv1', 'c1');

      expect(mockWorkOrderService.transition).toHaveBeenCalledWith(
        'wo1',
        'c1',
        'PAID',
      );
      expect(result).toEqual({ id: 'inv1', status: 'PAID' });
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.markPaid('inv999', 'c1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllByCompany', () => {
    it('should return invoices filtered by company', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);

      expect(await service.findAllByCompany('c1')).toEqual([]);
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith({
        where: { workOrder: { companyId: 'c1' } },
        include: { workOrder: true },
      });
    });
  });
});
