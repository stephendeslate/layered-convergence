import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    name: 'Sales Dashboard',
  };

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue(mockDashboard),
      findAll: vi.fn().mockResolvedValue([mockDashboard]),
      findOne: vi.fn().mockResolvedValue(mockDashboard),
      update: vi.fn().mockResolvedValue({ ...mockDashboard, name: 'Updated' }),
      remove: vi.fn().mockResolvedValue(mockDashboard),
    };

    const module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a dashboard', async () => {
    const result = await controller.create('tenant-1', { name: 'Sales Dashboard' });
    expect(result).toEqual(mockDashboard);
  });

  it('should find all dashboards', async () => {
    const result = await controller.findAll('tenant-1');
    expect(result).toEqual([mockDashboard]);
  });

  it('should find one dashboard', async () => {
    const result = await controller.findOne('tenant-1', 'dash-1');
    expect(result).toEqual(mockDashboard);
  });

  it('should update a dashboard', async () => {
    const result = await controller.update('tenant-1', 'dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should remove a dashboard', async () => {
    const result = await controller.remove('tenant-1', 'dash-1');
    expect(result).toEqual(mockDashboard);
  });

  it('should have an events SSE endpoint', () => {
    const observable = controller.events('dash-1');
    expect(observable).toBeDefined();
    expect(typeof observable.subscribe).toBe('function');
  });
});
