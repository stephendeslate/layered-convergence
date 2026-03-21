import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerController } from './customer.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockReq = (companyId: string) => ({ headers: { 'x-company-id': companyId }, companyId } as any);

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
    const dto = { companyId: 'c1', name: 'Cust', address: '1 St' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto as any);
    expect(result.id).toBe('1');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    await controller.findAll(mockReq('c1'));
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    await controller.findOne('1', mockReq('c1'));
    expect(mockService.findOne).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: '1' });
    await controller.update('1', { name: 'Updated' } as any, mockReq('c1'));
    expect(mockService.update).toHaveBeenCalledWith('1', 'c1', { name: 'Updated' });
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    await controller.remove('1', mockReq('c1'));
    expect(mockService.remove).toHaveBeenCalledWith('1', 'c1');
  });
});
