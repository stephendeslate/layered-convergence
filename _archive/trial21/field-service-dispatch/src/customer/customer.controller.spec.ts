import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerController } from './customer.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

function mockReq(companyId = 'c1') {
  return { headers: { 'x-company-id': companyId }, companyId } as any;
}

describe('CustomerController', () => {
  let controller: CustomerController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CustomerController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with dto', async () => {
    const dto = { companyId: 'c1', name: 'Jane', address: '123 Main' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto as any);
    expect(result.name).toBe('Jane');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    const result = await controller.findAll(mockReq());
    expect(Array.isArray(result)).toBe(true);
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: '1', name: 'Jane' });
    const result = await controller.findOne('1', mockReq());
    expect(result.name).toBe('Jane');
  });

  it('should call update with id, dto, and companyId', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Janet' });
    const result = await controller.update('1', { name: 'Janet' } as any, mockReq());
    expect(result.name).toBe('Janet');
  });

  it('should call remove with id and companyId', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1', mockReq());
    expect(result.id).toBe('1');
  });
});
