import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    name: 'Sales Dashboard',
    layout: {},
    isPublished: false,
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: vi.fn().mockResolvedValue(mockDashboard),
        findMany: vi.fn().mockResolvedValue([mockDashboard]),
        findFirst: vi.fn().mockResolvedValue(mockDashboard),
        update: vi.fn().mockResolvedValue({ ...mockDashboard, name: 'Updated' }),
        delete: vi.fn().mockResolvedValue(mockDashboard),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a dashboard', async () => {
    const result = await service.create('tenant-1', { name: 'Sales Dashboard' });
    expect(result).toEqual(mockDashboard);
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: { tenantId: 'tenant-1', name: 'Sales Dashboard', layout: {}, isPublished: false },
    });
  });

  it('should create a dashboard with layout and isPublished', async () => {
    await service.create('tenant-1', { name: 'Test', layout: { cols: 2 }, isPublished: true });
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: { tenantId: 'tenant-1', name: 'Test', layout: { cols: 2 }, isPublished: true },
    });
  });

  it('should find all dashboards for a tenant', async () => {
    const result = await service.findAll('tenant-1');
    expect(result).toEqual([mockDashboard]);
    expect(prisma.dashboard.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      include: { widgets: true, embed: true },
    });
  });

  it('should find one dashboard', async () => {
    const result = await service.findOne('tenant-1', 'dash-1');
    expect(result).toEqual(mockDashboard);
    expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
      where: { id: 'dash-1', tenantId: 'tenant-1' },
      include: { widgets: true, embed: true },
    });
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a dashboard', async () => {
    const result = await service.update('tenant-1', 'dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    const result = await service.remove('tenant-1', 'dash-1');
    expect(result).toEqual(mockDashboard);
  });

  it('should throw NotFoundException when deleting non-existent dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.remove('tenant-1', 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
