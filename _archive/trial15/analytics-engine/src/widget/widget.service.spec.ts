import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let mockPrisma: any;

  const mockWidget = {
    id: 'w-1',
    dashboardId: 'dash-1',
    type: 'line-chart',
    config: { dataSourceId: 'ds-1' },
    position: { x: 0, y: 0 },
    size: { w: 6, h: 4 },
  };

  beforeEach(() => {
    mockPrisma = {
      widget: {
        create: vi.fn().mockResolvedValue(mockWidget),
        findMany: vi.fn().mockResolvedValue([mockWidget]),
        findUnique: vi.fn().mockResolvedValue(mockWidget),
        update: vi.fn().mockResolvedValue({ ...mockWidget, type: 'bar-chart' }),
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
      type: 'line-chart',
      config: { dataSourceId: 'ds-1' },
    });
    expect(result).toEqual(mockWidget);
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
    const result = await service.update('w-1', { type: 'bar-chart' });
    expect(result.type).toBe('bar-chart');
  });

  it('should delete a widget', async () => {
    const result = await service.remove('w-1');
    expect(result).toEqual(mockWidget);
  });

  it('should throw NotFoundException when updating non-existent widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(null);
    await expect(service.update('w-999', { type: 'bar-chart' })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when deleting non-existent widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(null);
    await expect(service.remove('w-999')).rejects.toThrow(NotFoundException);
  });
});
