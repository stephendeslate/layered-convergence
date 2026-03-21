import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetService } from './widget.service.js';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  widget: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WidgetService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const dto = {
        dashboardId: 'dash-1',
        type: 'BAR_CHART' as any,
        config: {},
        positionX: 0,
        positionY: 0,
        width: 4,
        height: 3,
      };
      mockPrisma.widget.create.mockResolvedValue({ id: 'w-1', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('w-1');
    });
  });

  describe('findAllByDashboard', () => {
    it('should return widgets for a dashboard', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([{ id: 'w-1' }]);
      const result = await service.findAllByDashboard('dash-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith({
        where: { dashboardId: 'dash-1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return widget by id', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: 'w-1' });
      const result = await service.findOne('w-1');
      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: 'w-1' });
      mockPrisma.widget.update.mockResolvedValue({
        id: 'w-1',
        positionX: 5,
      });
      const result = await service.update('w-1', { positionX: 5 });
      expect(result.positionX).toBe(5);
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: 'w-1' });
      mockPrisma.widget.delete.mockResolvedValue({ id: 'w-1' });
      const result = await service.remove('w-1');
      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
