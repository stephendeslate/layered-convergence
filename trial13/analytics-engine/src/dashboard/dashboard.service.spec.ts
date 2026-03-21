import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: any;

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    name: 'Sales Dashboard',
    layout: [],
    isPublished: false,
    widgets: [],
  };

  beforeEach(() => {
    mockPrisma = {
      dashboard: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new DashboardService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      mockPrisma.dashboard.create.mockResolvedValue(mockDashboard);
      const result = await service.create('tenant-1', { name: 'Sales Dashboard' });
      expect(result).toEqual(mockDashboard);
    });

    it('should use default values for optional fields', async () => {
      mockPrisma.dashboard.create.mockResolvedValue(mockDashboard);
      await service.create('tenant-1', { name: 'Test' });
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          name: 'Test',
          layout: [],
          isPublished: false,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all dashboards for a tenant', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([mockDashboard]);
      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      const result = await service.findOne('tenant-1', 'dash-1');
      expect(result).toEqual(mockDashboard);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);
      await expect(service.findOne('tenant-1', 'dash-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when tenant mismatch', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({ ...mockDashboard, tenantId: 'other' });
      await expect(service.findOne('tenant-1', 'dash-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      mockPrisma.dashboard.update.mockResolvedValue({ ...mockDashboard, name: 'Updated' });
      const result = await service.update('tenant-1', 'dash-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      mockPrisma.dashboard.delete.mockResolvedValue(mockDashboard);
      const result = await service.remove('tenant-1', 'dash-1');
      expect(result).toEqual(mockDashboard);
    });
  });
});
