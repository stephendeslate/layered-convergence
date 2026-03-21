import { Request } from 'express';
import { InvoiceController } from './invoice.controller.js';

const mockService = {
  createFromWorkOrder: vi.fn(),
  markPaid: vi.fn(),
  findAllByCompany: vi.fn(),
};

const makeReq = (companyId = 'c1') =>
  ({ companyId } as unknown as Request & { companyId: string });

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

    const result = await controller.createFromWorkOrder(
      'wo1',
      { amount: 100 },
      makeReq(),
    );

    expect(result).toEqual({ id: 'inv1' });
    expect(mockService.createFromWorkOrder).toHaveBeenCalledWith('wo1', 'c1', 100);
  });

  it('should call markPaid', async () => {
    mockService.markPaid.mockResolvedValue({ id: 'inv1', status: 'PAID' });

    expect(await controller.markPaid('inv1', makeReq())).toEqual({
      id: 'inv1',
      status: 'PAID',
    });
    expect(mockService.markPaid).toHaveBeenCalledWith('inv1', 'c1');
  });

  it('should call findAll', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    expect(await controller.findAll(makeReq())).toEqual([]);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });
});
