import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: {
    widget: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    dashboard: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';
  const otherTenantId = 'tenant-2';

  const mockWidget = {
    id: 'w-1',
    tenantId,
    dashboardId: 'db-1',
    type: 'line',
    title: 'Revenue Chart',
    config: { metric: 'revenue' },
    position: { x: 0, y: 0, w: 6, h: 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      widget: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      dashboard: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  describe('create', () => {
    const createDto = {
      dashboardId: 'db-1',
      type: 'line',
      title: 'Revenue Chart',
      config: { metric: 'revenue' },
      position: { x: 0, y: 0, w: 6, h: 4 },
    };

    it('should create a widget when dashboard exists', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.widget.create.mockResolvedValue(mockWidget);

      const result = await service.create(tenantId, createDto);

      expect(result.id).toBe('w-1');
      expect(result.type).toBe('line');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify dashboard belongs to tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create(otherTenantId, createDto),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'db-1', tenantId: otherTenantId },
      });
    });

    it('should include tenantId in created widget', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.widget.create.mockResolvedValue(mockWidget);

      await service.create(tenantId, createDto);

      expect(prisma.widget.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId }),
      });
    });

    it('should pass position data correctly', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.widget.create.mockResolvedValue(mockWidget);

      await service.create(tenantId, createDto);

      expect(prisma.widget.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          position: { x: 0, y: 0, w: 6, h: 4 },
        }),
      });
    });
  });

  describe('findByDashboard', () => {
    it('should return widgets for a dashboard', async () => {
      prisma.widget.findMany.mockResolvedValue([
        { ...mockWidget, id: 'w-1' },
        { ...mockWidget, id: 'w-2', title: 'Users' },
      ]);

      const result = await service.findByDashboard(tenantId, 'db-1');

      expect(result).toHaveLength(2);
    });

    it('should filter by both tenantId and dashboardId', async () => {
      prisma.widget.findMany.mockResolvedValue([]);

      await service.findByDashboard(tenantId, 'db-1');

      expect(prisma.widget.findMany).toHaveBeenCalledWith({
        where: { tenantId, dashboardId: 'db-1' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should return empty array when no widgets exist', async () => {
      prisma.widget.findMany.mockResolvedValue([]);

      const result = await service.findByDashboard(tenantId, 'db-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(mockWidget);

      const result = await service.findOne(tenantId, 'w-1');

      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException if widget not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'w-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use tenantId in query for isolation', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne(otherTenantId, 'w-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: 'w-1', tenantId: otherTenantId },
      });
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(mockWidget);
      prisma.widget.update.mockResolvedValue({
        ...mockWidget,
        title: 'Updated Chart',
      });

      const result = await service.update(tenantId, 'w-1', {
        title: 'Updated Chart',
      });

      expect(result.title).toBe('Updated Chart');
    });

    it('should throw NotFoundException if widget not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'w-999', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent updating another tenants widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.update(otherTenantId, 'w-1', { title: 'Hijacked' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(mockWidget);
      prisma.widget.delete.mockResolvedValue(mockWidget);

      await service.remove(tenantId, 'w-1');

      expect(prisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } });
    });

    it('should throw NotFoundException if widget not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'w-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should prevent deleting another tenants widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.remove(otherTenantId, 'w-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
