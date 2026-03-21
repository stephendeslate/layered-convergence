import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';

describe('DashboardsController', () => {
  let controller: DashboardsController;
  let service: any;

  const mockReq = { user: { organizationId: 'org-1' } };

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'dash-1' }),
      create: vi.fn().mockResolvedValue({ id: 'dash-1' }),
      update: vi.fn().mockResolvedValue({ id: 'dash-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'dash-1' }),
      addWidget: vi.fn().mockResolvedValue({ id: 'widget-1' }),
      updateWidget: vi.fn().mockResolvedValue({ id: 'widget-1' }),
      removeWidget: vi.fn().mockResolvedValue({ id: 'widget-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [DashboardsController],
      providers: [{ provide: DashboardsService, useValue: service }],
    }).compile();

    controller = module.get<DashboardsController>(DashboardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should use orgId from request', async () => {
    await controller.findAll(mockReq);
    expect(service.findAll).toHaveBeenCalledWith('org-1');
  });

  it('create should pass dto and orgId', async () => {
    const dto = { name: 'Dashboard' };
    await controller.create(dto, mockReq);
    expect(service.create).toHaveBeenCalledWith(dto, 'org-1');
  });

  it('addWidget should pass dashboardId and dto', async () => {
    const dto = { type: 'bar_chart' };
    await controller.addWidget('dash-1', dto);
    expect(service.addWidget).toHaveBeenCalledWith('dash-1', dto);
  });

  it('remove should pass id', async () => {
    await controller.remove('dash-1');
    expect(service.remove).toHaveBeenCalledWith('dash-1');
  });
});
