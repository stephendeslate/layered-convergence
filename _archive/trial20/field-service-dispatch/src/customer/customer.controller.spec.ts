import { Request } from 'express';
import { CustomerController } from './customer.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const makeReq = (companyId = 'c1') =>
  ({ companyId } as unknown as Request & { companyId: string });

describe('CustomerController', () => {
  let controller: CustomerController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CustomerController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    const dto = { companyId: 'c1', name: 'Jane', address: '123 Main' };
    mockService.create.mockResolvedValue({ id: 'cu1', ...dto });

    expect(await controller.create(dto)).toEqual({ id: 'cu1', ...dto });
  });

  it('should call findAll with companyId from request', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    expect(await controller.findAll(makeReq())).toEqual([]);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: 'cu1' });

    expect(await controller.findOne('cu1', makeReq())).toEqual({ id: 'cu1' });
    expect(mockService.findOne).toHaveBeenCalledWith('cu1', 'c1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: 'cu1', name: 'Updated' });

    expect(await controller.update('cu1', { name: 'Updated' } as any, makeReq())).toEqual({
      id: 'cu1',
      name: 'Updated',
    });
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: 'cu1' });

    expect(await controller.remove('cu1', makeReq())).toEqual({ id: 'cu1' });
  });
});
