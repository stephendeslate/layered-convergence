import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let mockPrisma: any;

  const mockWidget = {
    id: 'w-1',
    dashboardId: 'dash-1',
    type: 'line_chart',
    config: { metric: 'views' },
    position: { x: 0, y: 0 },
    size: { w: 6, h: 4 },
  };

  beforeEach(() => {
    mockPrisma = {
      widget: {
        create: vi.fn().mockResolvedValue(mockWidget),
        findMany: vi.fn().mockResolvedValue([mockWidget]),
        findUnique: vi.fn().mockResolvedValue(mockWidget),
        update: vi.fn().mockResolvedValue({ ...mockWidget, type: 'bar_chart' }),
        delete: vi.fn().mockResolvedValue(mockWidget),
      },
    };
    service = new WidgetService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a widget', async () => {
    const result = await service.create({
      dashboardId: 'dash-1',
      type: 'line_chart',
      config: { metric: 'views' },
    });
    expect(result).toEqual(mockWidget);
  });

  it('should create with default empty objects', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'kpi' });
    const call = mockPrisma.widget.create.mock.calls[0][0];
    expect(call.data.config).toEqual({});
    expect(call.data.position).toEqual({});
    expect(call.data.size).toEqual({});
  });

  it('should find widgets by dashboard', async () => {
    const result = await service.findByDashboard('dash-1');
    expect(result).toHaveLength(1);
  });

  it('should find one widget by id', async () => {
    const result = await service.findOne('w-1');
    expect(result.id).toBe('w-1');
  });

  it('should throw NotFoundException when widget not found', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(null);
    await expect(service.findOne('w-999')).rejects.toThrow(NotFoundException);
  });

  it('should update a widget', async () => {
    const result = await service.update('w-1', { type: 'bar_chart' });
    expect(result.type).toBe('bar_chart');
  });

  it('should remove a widget', async () => {
    await service.remove('w-1');
    expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } });
  });
});
