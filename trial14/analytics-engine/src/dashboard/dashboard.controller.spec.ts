import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockService: any;

  const mockReq = { tenantId: 'tenant-1' } as any;

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: 'dash-1', name: 'Test' }),
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'dash-1' }),
      update: vi.fn().mockResolvedValue({ id: 'dash-1', name: 'Updated' }),
      remove: vi.fn().mockResolvedValue({ id: 'dash-1' }),
    };
    controller = new DashboardController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a dashboard', async () => {
    await controller.create(mockReq, { name: 'Test' });
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', { name: 'Test' });
  });

  it('should find all dashboards', async () => {
    await controller.findAll(mockReq);
    expect(mockService.findAll).toHaveBeenCalledWith('tenant-1');
  });

  it('should find one dashboard', async () => {
    await controller.findOne(mockReq, 'dash-1');
    expect(mockService.findOne).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should update a dashboard', async () => {
    await controller.update(mockReq, 'dash-1', { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith('tenant-1', 'dash-1', { name: 'Updated' });
  });

  it('should remove a dashboard', async () => {
    await controller.remove(mockReq, 'dash-1');
    expect(mockService.remove).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });
});
