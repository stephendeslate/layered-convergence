import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardController } from './dashboard.controller.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;
  const tenantId = 'tenant-uuid';
  const req = { tenantId } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new DashboardController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with tenantId', async () => {
    mockService.create.mockResolvedValue({ id: 'd-1', name: 'Sales' });
    const result = await controller.create(req, { name: 'Sales', layout: {} });
    expect(result.name).toBe('Sales');
    expect(mockService.create).toHaveBeenCalledWith(tenantId, {
      name: 'Sales',
      layout: {},
    });
  });

  it('should call findAll with tenantId', async () => {
    mockService.findAll.mockResolvedValue([{ id: 'd-1' }]);
    const result = await controller.findAll(req);
    expect(result).toHaveLength(1);
  });

  it('should call findOne with tenantId and id', async () => {
    mockService.findOne.mockResolvedValue({ id: 'd-1' });
    const result = await controller.findOne(req, 'd-1');
    expect(result.id).toBe('d-1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: 'd-1', name: 'New' });
    const result = await controller.update(req, 'd-1', { name: 'New' });
    expect(result.name).toBe('New');
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: 'd-1' });
    const result = await controller.remove(req, 'd-1');
    expect(result.id).toBe('d-1');
  });
});
