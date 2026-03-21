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

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue({ id: 'dash-1', name: 'Test' }),
      findAll: vi.fn().mockResolvedValue([{ id: 'dash-1' }]),
      findOne: vi.fn().mockResolvedValue({ id: 'dash-1' }),
      update: vi.fn().mockResolvedValue({ id: 'dash-1', name: 'Updated' }),
      remove: vi.fn().mockResolvedValue({ id: 'dash-1' }),
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
    const result = await controller.create('tenant-1', { name: 'Test' });
    expect(result.name).toBe('Test');
  });

  it('should find all dashboards', async () => {
    const result = await controller.findAll('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should find one dashboard', async () => {
    const result = await controller.findOne('tenant-1', 'dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should update a dashboard', async () => {
    const result = await controller.update('tenant-1', 'dash-1', {
      name: 'Updated',
    });
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    await controller.remove('tenant-1', 'dash-1');
    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });
});
