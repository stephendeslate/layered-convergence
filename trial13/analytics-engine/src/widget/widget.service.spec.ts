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
    config: { dataSourceId: 'ds-1', metric: 'views' },
    position: { x: 0, y: 0 },
    size: { w: 6, h: 4 },
  };

  beforeEach(() => {
    mockPrisma = {
      widget: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new WidgetService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a widget', async () => {
      mockPrisma.widget.create.mockResolvedValue(mockWidget);
      const result = await service.create({
        dashboardId: 'dash-1',
        type: 'line_chart',
        config: { dataSourceId: 'ds-1', metric: 'views' },
      });
      expect(result).toEqual(mockWidget);
    });

    it('should use defaults for optional fields', async () => {
      mockPrisma.widget.create.mockResolvedValue(mockWidget);
      await service.create({ dashboardId: 'dash-1', type: 'bar_chart' });
      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: {
          dashboardId: 'dash-1',
          type: 'bar_chart',
          config: {},
          position: {},
          size: {},
        },
      });
    });
  });

  describe('findByDashboard', () => {
    it('should return widgets for a dashboard', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([mockWidget]);
      const result = await service.findByDashboard('dash-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a widget by id', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);
      const result = await service.findOne('w-1');
      expect(result).toEqual(mockWidget);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);
      await expect(service.findOne('w-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);
      mockPrisma.widget.update.mockResolvedValue({ ...mockWidget, type: 'bar_chart' });
      const result = await service.update('w-1', { type: 'bar_chart' });
      expect(result.type).toBe('bar_chart');
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);
      mockPrisma.widget.delete.mockResolvedValue(mockWidget);
      const result = await service.remove('w-1');
      expect(result).toEqual(mockWidget);
    });

    it('should throw NotFoundException when deleting non-existent widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);
      await expect(service.remove('w-999')).rejects.toThrow(NotFoundException);
    });
  });
});
