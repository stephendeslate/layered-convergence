import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service.js';
import { NotFoundException } from '@nestjs/common';

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
  const tenantId = 'tenant-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        name: 'Sales',
        tenantId,
      });
      const result = await service.create(tenantId, {
        name: 'Sales',
        layout: {},
      });
      expect(result.name).toBe('Sales');
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: { name: 'Sales', layout: {}, tenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all dashboards for tenant', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([
        { id: '1' },
        { id: '2' },
      ]);
      const result = await service.findAll(tenantId);
      expect(result).toHaveLength(2);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { widgets: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return dashboard by id scoped to tenant', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId,
      });
      const result = await service.findOne(tenantId, 'dash-1');
      expect(result.id).toBe('dash-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        name: 'Updated',
      });
      const result = await service.update(tenantId, 'dash-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(
        service.update(tenantId, 'nonexistent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });
      const result = await service.remove(tenantId, 'dash-1');
      expect(result.id).toBe('dash-1');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
