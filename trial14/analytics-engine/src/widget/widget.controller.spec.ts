import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetController } from './widget.controller';

describe('WidgetController', () => {
  let controller: WidgetController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: 'w-1', type: 'line_chart' }),
      findByDashboard: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'w-1' }),
      update: vi.fn().mockResolvedValue({ id: 'w-1', type: 'bar_chart' }),
      remove: vi.fn().mockResolvedValue({ id: 'w-1' }),
    };
    controller = new WidgetController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a widget', async () => {
    await controller.create({ dashboardId: 'dash-1', type: 'line_chart' });
    expect(mockService.create).toHaveBeenCalledWith({ dashboardId: 'dash-1', type: 'line_chart' });
  });

  it('should find widgets by dashboard', async () => {
    await controller.findByDashboard('dash-1');
    expect(mockService.findByDashboard).toHaveBeenCalledWith('dash-1');
  });

  it('should find one widget', async () => {
    await controller.findOne('w-1');
    expect(mockService.findOne).toHaveBeenCalledWith('w-1');
  });

  it('should update a widget', async () => {
    await controller.update('w-1', { type: 'bar_chart' });
    expect(mockService.update).toHaveBeenCalledWith('w-1', { type: 'bar_chart' });
  });

  it('should remove a widget', async () => {
    await controller.remove('w-1');
    expect(mockService.remove).toHaveBeenCalledWith('w-1');
  });
});
