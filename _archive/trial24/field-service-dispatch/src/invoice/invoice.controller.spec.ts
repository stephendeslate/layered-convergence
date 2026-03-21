import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceController } from './invoice.controller.js';

const mockService = {
  createFromWorkOrder: vi.fn(),
  markPaid: vi.fn(),
  findAllByCompany: vi.fn(),
};

const mockReq = (companyId = 'c1') => ({ companyId, headers: { 'x-company-id': companyId } }) as any;

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
    mockService.createFromWorkOrder.mockResolvedValue({ id: 'i1', amount: 100 });

    const result = await controller.createFromWorkOrder('wo1', { amount: 100 }, mockReq());
    expect(result.amount).toBe(100);
  });

  it('should call markPaid', async () => {
    mockService.markPaid.mockResolvedValue({ id: 'i1', status: 'PAID' });

    const result = await controller.markPaid('i1', mockReq());
    expect(result.status).toBe('PAID');
  });

  it('should call findAll', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    const result = await controller.findAll(mockReq());
    expect(Array.isArray(result)).toBe(true);
  });
});
