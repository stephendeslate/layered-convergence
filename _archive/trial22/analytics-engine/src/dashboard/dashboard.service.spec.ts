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
      count: ReturnType<typeof vi.fn>;
    };
  };

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 't-1',
    name: 'Test Dashboard',
    layout: {},
    isPublished: false,
    widgets: [],
    embed: null,
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: vi.fn().mockResolvedValue(mockDashboard),
        findMany: vi.fn().mockResolvedValue([mockDashboard]),
        findFirst: vi.fn().mockResolvedValue(mockDashboard),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...mockDashboard,
          ...data,
        })),
        delete: vi.fn().mockResolvedValue(mockDashboard),
        count: vi.fn().mockResolvedValue(3),
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
    const result = await service.create('t-1', { name: 'Test Dashboard' });
    expect(result.id).toBe('dash-1');
  });

  it('should pass default layout when not provided', async () => {
    await service.create('t-1', { name: 'Test' });
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ layout: {} }),
    });
  });

  it('should pass default isPublished when not provided', async () => {
    await service.create('t-1', { name: 'Test' });
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ isPublished: false }),
    });
  });

  it('should find all dashboards for a tenant', async () => {
    const result = await service.findAll('t-1');
    expect(result).toHaveLength(1);
    expect(prisma.dashboard.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't-1' },
      include: { widgets: true, embed: true },
    });
  });

  it('should find one dashboard by id and tenant', async () => {
    const result = await service.findOne('t-1', 'dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a dashboard', async () => {
    const result = await service.update('t-1', 'dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should throw NotFoundException when updating non-existent dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.update('t-1', 'missing', { name: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('should remove a dashboard', async () => {
    await service.remove('t-1', 'dash-1');
    expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
  });

  it('should throw NotFoundException when removing non-existent dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.remove('t-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('should count dashboards by tenant', async () => {
    const result = await service.countByTenant('t-1');
    expect(result).toBe(3);
  });
});
