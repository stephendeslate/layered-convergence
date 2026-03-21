import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockService: any;

  const mockReq = { tenantId: 'tenant-1' } as any;
  const mockDashboard = { id: 'dash-1', tenantId: 'tenant-1', name: 'Dashboard' };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockDashboard),
      findAll: vi.fn().mockResolvedValue([mockDashboard]),
      findOne: vi.fn().mockResolvedValue(mockDashboard),
      update: vi.fn().mockResolvedValue({ ...mockDashboard, name: 'Updated' }),
      remove: vi.fn().mockResolvedValue(mockDashboard),
    };
    controller = new DashboardController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a dashboard', async () => {
    const result = await controller.create(mockReq, { name: 'Dashboard' });
    expect(result).toEqual(mockDashboard);
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', { name: 'Dashboard' });
  });

  it('should find all dashboards', async () => {
    const result = await controller.findAll(mockReq);
    expect(result).toHaveLength(1);
  });

  it('should find one dashboard', async () => {
    const result = await controller.findOne(mockReq, 'dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should update a dashboard', async () => {
    const result = await controller.update(mockReq, 'dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    const result = await controller.remove(mockReq, 'dash-1');
    expect(result).toEqual(mockDashboard);
  });
});
