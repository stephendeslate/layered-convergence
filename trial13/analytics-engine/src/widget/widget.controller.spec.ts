import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetController } from './widget.controller';

describe('WidgetController', () => {
  let controller: WidgetController;
  let mockService: any;

  const mockWidget = {
    id: 'w-1',
    dashboardId: 'dash-1',
    type: 'line_chart',
    config: {},
    position: {},
    size: {},
  };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockWidget),
      findByDashboard: vi.fn().mockResolvedValue([mockWidget]),
      findOne: vi.fn().mockResolvedValue(mockWidget),
      update: vi.fn().mockResolvedValue({ ...mockWidget, type: 'bar_chart' }),
      remove: vi.fn().mockResolvedValue(mockWidget),
    };
    controller = new WidgetController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a widget', async () => {
    const result = await controller.create({ dashboardId: 'dash-1', type: 'line_chart' });
    expect(result).toEqual(mockWidget);
  });

  it('should find widgets by dashboard', async () => {
    const result = await controller.findByDashboard('dash-1');
    expect(result).toHaveLength(1);
  });

  it('should find one widget', async () => {
    const result = await controller.findOne('w-1');
    expect(result).toEqual(mockWidget);
  });

  it('should update a widget', async () => {
    const result = await controller.update('w-1', { type: 'bar_chart' });
    expect(result.type).toBe('bar_chart');
  });

  it('should remove a widget', async () => {
    const result = await controller.remove('w-1');
    expect(result).toEqual(mockWidget);
  });
});
