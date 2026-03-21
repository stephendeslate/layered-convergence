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
    name: 'Test Dashboard',
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
    const result = await service.create('tenant-1', { name: 'Test Dashboard' });
    expect(result).toEqual(mockDashboard);
  });

  it('should create with defaults for optional fields', async () => {
    await service.create('tenant-1', { name: 'Test' });
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        layout: {},
        isPublished: false,
      }),
    });
  });

  it('should find all dashboards for a tenant', async () => {
    const result = await service.findAll('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should find one dashboard', async () => {
    const result = await service.findOne('tenant-1', 'dash-1');
    expect(result).toEqual(mockDashboard);
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'dash-999')).rejects.toThrow(
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

  it('should throw NotFoundException on delete if not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.remove('tenant-1', 'dash-999')).rejects.toThrow(
      NotFoundException,
    );
  });
});
