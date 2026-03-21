import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: {
    dashboard: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    widget: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';

  const mockWidget = {
    id: 'w-1',
    tenantId,
    dashboardId: 'db-1',
    type: 'BAR',
    title: 'Revenue Chart',
    config: { metric: 'revenue' },
    position: { x: 0, y: 0, w: 6, h: 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findFirst: vi.fn(),
      },
      widget: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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
    it('should create a widget when dashboard exists', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.widget.create.mockResolvedValue(mockWidget);

      const result = await service.create(tenantId, {
        dashboardId: 'db-1',
        type: 'BAR',
        title: 'Revenue Chart',
        config: { metric: 'revenue' },
        position: { x: 0, y: 0, w: 6, h: 4 },
      });

      expect(result.id).toBe('w-1');
      expect(prisma.widget.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, dashboardId: 'db-1' }),
      });
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          dashboardId: 'db-999',
          type: 'BAR',
          title: 'Chart',
          config: {},
          position: {},
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify dashboard belongs to tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          dashboardId: 'db-other',
          type: 'LINE',
          title: 'Chart',
          config: {},
          position: {},
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'db-other', tenantId },
      });
    });
  });

  describe('findByDashboard', () => {
    it('should return widgets for a dashboard', async () => {
      prisma.widget.findMany.mockResolvedValue([mockWidget]);

      const result = await service.findByDashboard(tenantId, 'db-1');

      expect(result).toHaveLength(1);
      expect(prisma.widget.findMany).toHaveBeenCalledWith({
        where: { tenantId, dashboardId: 'db-1' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(mockWidget);

      const result = await service.findOne(tenantId, 'w-1');

      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'w-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(mockWidget);
      prisma.widget.update.mockResolvedValue({ ...mockWidget, title: 'Updated' });

      const result = await service.update(tenantId, 'w-1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if widget not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'w-999', { title: 'Updated' }),
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
  });
});
