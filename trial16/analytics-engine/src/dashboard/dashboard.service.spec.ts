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
  const otherTenantId = 'tenant-2';

  const mockDashboard = {
    id: 'db-1',
    tenantId,
    name: 'Sales Dashboard',
    description: 'Revenue overview',
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
    it('should create a dashboard with tenantId', async () => {
      prisma.dashboard.create.mockResolvedValue(mockDashboard);

      const result = await service.create(tenantId, { name: 'Sales Dashboard' });

      expect(result.name).toBe('Sales Dashboard');
      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, name: 'Sales Dashboard' }),
      });
    });

    it('should create dashboard with default isPublic false', async () => {
      prisma.dashboard.create.mockResolvedValue({ ...mockDashboard, isPublic: false });

      await service.create(tenantId, { name: 'Private Dashboard' });

      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ isPublic: false }),
      });
    });

    it('should allow creating public dashboard', async () => {
      prisma.dashboard.create.mockResolvedValue({ ...mockDashboard, isPublic: true });

      await service.create(tenantId, { name: 'Public', isPublic: true });

      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ isPublic: true }),
      });
    });

    it('should create dashboard with description', async () => {
      prisma.dashboard.create.mockResolvedValue({
        ...mockDashboard,
        description: 'Overview',
      });

      await service.create(tenantId, { name: 'Sales', description: 'Overview' });

      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ description: 'Overview' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return dashboards with widget count', async () => {
      prisma.dashboard.findMany.mockResolvedValue([
        { ...mockDashboard, _count: { widgets: 3 } },
        { ...mockDashboard, id: 'db-2', name: 'Marketing', _count: { widgets: 1 } },
      ]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(2);
    });

    it('should filter by tenantId', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId } }),
      );
    });

    it('should order by createdAt desc', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should return empty array when tenant has no dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);

      const result = await service.findAll(otherTenantId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard with widgets and embeds', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        ...mockDashboard,
        widgets: [{ id: 'w-1' }],
        embeds: [{ id: 'e-1' }],
      });

      const result = await service.findOne(tenantId, 'db-1');

      expect(result.id).toBe('db-1');
      expect(result.widgets).toHaveLength(1);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'db-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use findFirst with tenantId for isolation', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne(otherTenantId, 'db-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'db-1', tenantId: otherTenantId },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);
      prisma.dashboard.update.mockResolvedValue({
        ...mockDashboard,
        name: 'Updated Dashboard',
      });

      const result = await service.update(tenantId, 'db-1', {
        name: 'Updated Dashboard',
      });

      expect(result.name).toBe('Updated Dashboard');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'db-999', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent updating dashboard from another tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.update(otherTenantId, 'db-1', { name: 'Hijacked' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);
      prisma.dashboard.delete.mockResolvedValue(mockDashboard);

      await service.remove(tenantId, 'db-1');

      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'db-1' } });
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'db-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should prevent deleting dashboard from another tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.remove(otherTenantId, 'db-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
