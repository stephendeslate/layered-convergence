import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerController } from './customer.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockReq = (companyId = 'c1') => ({ companyId, headers: { 'x-company-id': companyId } }) as any;

describe('CustomerController', () => {
  let controller: CustomerController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CustomerController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const dto = { companyId: 'c1', name: 'John', address: '1 St' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.create(dto);
    expect(result.name).toBe('John');
  });

  it('should call findAll with companyId from request', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    const result = await controller.findAll(mockReq());
    expect(Array.isArray(result)).toBe(true);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: '1', name: 'Test' });

    const result = await controller.findOne('1', mockReq());
    expect(result.id).toBe('1');
  });

  it('should call update with id, companyId, and dto', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });

    const result = await controller.update('1', { name: 'Updated' }, mockReq());
    expect(result.name).toBe('Updated');
  });

  it('should call remove with id and companyId', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });

    const result = await controller.remove('1', mockReq());
    expect(result.id).toBe('1');
  });
});
