import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: any;

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    name: 'My Dashboard',
    layout: [],
    isPublished: false,
  };

  beforeEach(() => {
    mockPrisma = {
      dashboard: {
        create: vi.fn().mockResolvedValue(mockDashboard),
        findMany: vi.fn().mockResolvedValue([mockDashboard]),
        findUnique: vi.fn().mockResolvedValue(mockDashboard),
        update: vi.fn().mockResolvedValue({ ...mockDashboard, name: 'Updated' }),
        delete: vi.fn().mockResolvedValue(mockDashboard),
      },
    };
    service = new DashboardService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a dashboard', async () => {
    const result = await service.create('tenant-1', { name: 'My Dashboard' });
    expect(result).toEqual(mockDashboard);
    expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
      data: { tenantId: 'tenant-1', name: 'My Dashboard', layout: [], isPublished: false },
    });
  });

  it('should create a dashboard with layout and isPublished', async () => {
    const result = await service.create('tenant-1', {
      name: 'Published',
      layout: [{ w: 1, h: 1 }],
      isPublished: true,
    });
    expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        name: 'Published',
        layout: [{ w: 1, h: 1 }],
        isPublished: true,
      },
    });
  });

  it('should find all dashboards for a tenant', async () => {
    const result = await service.findAll('tenant-1');
    expect(result).toHaveLength(1);
    expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      include: { widgets: true },
    });
  });

  it('should find one dashboard by id', async () => {
    const result = await service.findOne('tenant-1', 'dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'dash-999')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when tenant does not own dashboard', async () => {
    await expect(service.findOne('other-tenant', 'dash-1')).rejects.toThrow(NotFoundException);
  });

  it('should update a dashboard', async () => {
    const result = await service.update('tenant-1', 'dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    const result = await service.remove('tenant-1', 'dash-1');
    expect(result).toEqual(mockDashboard);
  });
});
