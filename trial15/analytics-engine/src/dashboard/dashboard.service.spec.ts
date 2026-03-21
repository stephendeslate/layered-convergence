import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  dashboard: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard with tenant', async () => {
      const dto = { name: 'My Dashboard' };
      const expected = { id: 'dash-1', ...dto, layout: [], tenantId: 'tenant-1' };
      mockPrisma.dashboard.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
    });

    it('should create a dashboard with custom layout', async () => {
      const dto = { name: 'Dashboard', layout: [{ x: 0, y: 0, w: 6, h: 4 }] };
      mockPrisma.dashboard.create.mockResolvedValue({ id: 'dash-1', ...dto });

      await service.create('tenant-1', dto);

      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: {
          name: 'Dashboard',
          layout: [{ x: 0, y: 0, w: 6, h: 4 }],
          tenantId: 'tenant-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all dashboards with widgets', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([
        { id: 'dash-1', widgets: [] },
      ]);

      const result = await service.findAll('tenant-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
        include: { widgets: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenantId', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', widgets: [] });

      const result = await service.findOne('tenant-1', 'dash-1');

      expect(result.id).toBe('dash-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'dash-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a dashboard name', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', widgets: [] });
      mockPrisma.dashboard.update.mockResolvedValue({ id: 'dash-1', name: 'Updated', widgets: [] });

      const result = await service.update('tenant-1', 'dash-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should update a dashboard layout', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', widgets: [] });
      mockPrisma.dashboard.update.mockResolvedValue({ id: 'dash-1', layout: [{ x: 1 }], widgets: [] });

      await service.update('tenant-1', 'dash-1', { layout: [{ x: 1 }] });

      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        data: { layout: [{ x: 1 }] },
        include: { widgets: true },
      });
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.update('tenant-1', 'dash-999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', widgets: [] });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      const result = await service.remove('tenant-1', 'dash-1');

      expect(result).toEqual({ id: 'dash-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'dash-999')).rejects.toThrow(NotFoundException);
    });
  });
});
