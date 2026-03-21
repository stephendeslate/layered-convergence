import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  widget: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WidgetService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a widget with tenantId', async () => {
      const dto = { name: 'Chart', type: 'line', dashboardId: 'dash-1' };
      const expected = { id: 'w-1', ...dto, config: {}, tenantId: 'tenant-1' };
      mockPrisma.widget.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
    });

    it('should create a widget with custom config', async () => {
      const dto = {
        name: 'Chart',
        type: 'bar',
        config: { metric: 'cpu', color: 'blue' },
        dashboardId: 'dash-1',
      };
      mockPrisma.widget.create.mockResolvedValue({ id: 'w-1', ...dto });

      await service.create('tenant-1', dto);

      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: {
          name: 'Chart',
          type: 'bar',
          config: { metric: 'cpu', color: 'blue' },
          dashboardId: 'dash-1',
          tenantId: 'tenant-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all widgets for a tenant', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([{ id: 'w-1' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toHaveLength(1);
    });

    it('should filter by dashboardId', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1', 'dash-1');

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', dashboardId: 'dash-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a widget by id and tenantId', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w-1' });

      const result = await service.findOne('tenant-1', 'w-1');

      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'w-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w-1' });
      mockPrisma.widget.update.mockResolvedValue({ id: 'w-1', name: 'Updated' });

      const result = await service.update('tenant-1', 'w-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should update widget config', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w-1' });
      mockPrisma.widget.update.mockResolvedValue({ id: 'w-1', config: { color: 'red' } });

      await service.update('tenant-1', 'w-1', { config: { color: 'red' } });

      expect(mockPrisma.widget.update).toHaveBeenCalledWith({
        where: { id: 'w-1' },
        data: { config: { color: 'red' } },
      });
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.update('tenant-1', 'w-999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w-1' });
      mockPrisma.widget.delete.mockResolvedValue({ id: 'w-1' });

      const result = await service.remove('tenant-1', 'w-1');

      expect(result).toEqual({ id: 'w-1' });
    });

    it('should throw NotFoundException if widget to delete not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'w-999')).rejects.toThrow(NotFoundException);
    });
  });
});
