import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockService: any;

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    name: 'Dashboard',
    layout: [],
    isPublished: false,
  };

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
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.create(req, { name: 'Dashboard' });
    expect(result).toEqual(mockDashboard);
  });

  it('should find all dashboards', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.findAll(req);
    expect(result).toHaveLength(1);
  });

  it('should find one dashboard', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.findOne(req, 'dash-1');
    expect(result).toEqual(mockDashboard);
  });

  it('should update a dashboard', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.update(req, 'dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should remove a dashboard', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.remove(req, 'dash-1');
    expect(result).toEqual(mockDashboard);
  });
});
