import { describe, it, expect, beforeEach } from 'vitest';
import { WidgetService } from './widget.service';

function createMockPrisma() {
  return {
    widget: {
      create: async (args: any) => ({ id: 'widget-1', ...args.data }),
      findMany: async () => [{ id: 'widget-1', type: 'line_chart' }],
      findUniqueOrThrow: async () => ({ id: 'widget-1', type: 'line_chart' }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
    },
  } as any;
}

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(() => {
    service = new WidgetService(createMockPrisma());
  });

  it('should create a widget', async () => {
    const result = await service.create({ dashboardId: 'dash-1', type: 'line_chart' });
    expect(result.type).toBe('line_chart');
  });

  it('should find all widgets', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find widgets by dashboard', async () => {
    const result = await service.findByDashboard('dash-1');
    expect(result).toBeDefined();
  });

  it('should find one widget', async () => {
    const result = await service.findOne('widget-1');
    expect(result.id).toBe('widget-1');
  });

  it('should update a widget', async () => {
    const result = await service.update('widget-1', { type: 'bar_chart' });
    expect(result.type).toBe('bar_chart');
  });

  it('should delete a widget', async () => {
    const result = await service.remove('widget-1');
    expect(result.id).toBe('widget-1');
  });

  it('should create a widget with position and size', async () => {
    const result = await service.create({
      dashboardId: 'dash-1',
      type: 'kpi_card',
      positionX: 2,
      positionY: 3,
      width: 4,
      height: 2,
    });
    expect(result.positionX).toBe(2);
    expect(result.width).toBe(4);
  });

  it('should filter widgets by dashboardId', async () => {
    const result = await service.findAll('dash-1');
    expect(result).toBeDefined();
  });
});
