import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
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

  const tenantId = 'tenant-1';

  const mockDashboard = {
    id: 'db-1',
    tenantId,
    name: 'Sales Dashboard',
    description: null,
    layout: {},
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      prisma.dashboard.create.mockResolvedValue(mockDashboard);

      const result = await service.create(tenantId, { name: 'Sales Dashboard' });

      expect(result.id).toBe('db-1');
      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, name: 'Sales Dashboard' }),
      });
    });

    it('should default isPublic to false', async () => {
      prisma.dashboard.create.mockResolvedValue(mockDashboard);

      await service.create(tenantId, { name: 'Dashboard' });

      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ isPublic: false }),
      });
    });
  });

  describe('findAll', () => {
    it('should return dashboards with widget count', async () => {
      prisma.dashboard.findMany.mockResolvedValue([
        { ...mockDashboard, _count: { widgets: 3 } },
      ]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(1);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { _count: { select: { widgets: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return dashboard with widgets and embeds', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        ...mockDashboard,
        widgets: [],
        embeds: [],
      });

      const result = await service.findOne(tenantId, 'db-1');

      expect(result.id).toBe('db-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'db-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not find dashboard from another tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-2', 'db-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);
      prisma.dashboard.update.mockResolvedValue({ ...mockDashboard, name: 'Updated' });

      const result = await service.update(tenantId, 'db-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);
      prisma.dashboard.delete.mockResolvedValue(mockDashboard);

      await service.remove(tenantId, 'db-1');

      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'db-1' } });
    });
  });
});
