import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceController } from './invoice.controller.js';

const mockService = {
  createFromWorkOrder: vi.fn(),
  markPaid: vi.fn(),
  findAllByCompany: vi.fn(),
};

function mockReq(companyId = 'c1') {
  return { headers: { 'x-company-id': companyId }, companyId } as any;
}

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
    mockService.createFromWorkOrder.mockResolvedValue({ id: '1', amount: 150 });
    const result = await controller.createFromWorkOrder('wo1', { amount: 150 } as any, mockReq());
    expect(result.amount).toBe(150);
    expect(mockService.createFromWorkOrder).toHaveBeenCalledWith('wo1', 'c1', 150);
  });

  it('should call markPaid', async () => {
    mockService.markPaid.mockResolvedValue({ id: '1', status: 'PAID' });
    const result = await controller.markPaid('1', mockReq());
    expect(result.status).toBe('PAID');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    const result = await controller.findAll(mockReq());
    expect(Array.isArray(result)).toBe(true);
  });
});
