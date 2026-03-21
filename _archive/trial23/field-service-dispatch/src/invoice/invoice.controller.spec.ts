import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceController } from './invoice.controller.js';

const mockService = {
  createFromWorkOrder: vi.fn(),
  markPaid: vi.fn(),
  findAllByCompany: vi.fn(),
};

const mockReq = (companyId: string) => ({ headers: { 'x-company-id': companyId }, companyId } as any);

describe('InvoiceController', () => {
  let controller: InvoiceController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new InvoiceController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createFromWorkOrder', async () => {
    mockService.createFromWorkOrder.mockResolvedValue({ id: 'inv1' });
    await controller.createFromWorkOrder('wo1', { amount: 150 } as any, mockReq('c1'));
    expect(mockService.createFromWorkOrder).toHaveBeenCalledWith('wo1', 'c1', 150);
  });

  it('should call markPaid', async () => {
    mockService.markPaid.mockResolvedValue({ id: 'inv1', status: 'PAID' });
    await controller.markPaid('inv1', mockReq('c1'));
    expect(mockService.markPaid).toHaveBeenCalledWith('inv1', 'c1');
  });

  it('should call findAll', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    await controller.findAll(mockReq('c1'));
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });
});
