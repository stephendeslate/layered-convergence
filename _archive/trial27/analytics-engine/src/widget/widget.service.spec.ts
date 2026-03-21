import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
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
    };

    const module = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(WidgetService);
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const dto = { dashboardId: 'd-1', type: 'bar_chart' };
      prisma.widget.create.mockResolvedValue({ id: 'w-1', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('w-1');
    });

    it('should default position to 0', async () => {
      prisma.widget.create.mockResolvedValue({ id: 'w-1' });
      await service.create({ dashboardId: 'd-1', type: 'line_chart' });
      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 0 }),
        }),
      );
    });

    it('should default width to 6 and height to 4', async () => {
      prisma.widget.create.mockResolvedValue({ id: 'w-1' });
      await service.create({ dashboardId: 'd-1', type: 'pie_chart' });
      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ width: 6, height: 4 }),
        }),
      );
    });

    it('should default config to empty object', async () => {
      prisma.widget.create.mockResolvedValue({ id: 'w-1' });
      await service.create({ dashboardId: 'd-1', type: 'table' });
      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ config: {} }),
        }),
      );
    });
  });

  describe('findByDashboardId', () => {
    it('should return widgets ordered by position', async () => {
      prisma.widget.findMany.mockResolvedValue([{ id: 'w-1' }]);
      const result = await service.findByDashboardId('d-1');
      expect(result).toHaveLength(1);
    });

    it('should order by position ascending', async () => {
      prisma.widget.findMany.mockResolvedValue([]);
      await service.findByDashboardId('d-1');
      expect(prisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { position: 'asc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return widget by id', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: 'w-1' });
      const result = await service.findOne('w-1');
      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: 'w-1' });
      prisma.widget.update.mockResolvedValue({ id: 'w-1', position: 5 });
      const result = await service.update('w-1', { position: 5 });
      expect(result.position).toBe(5);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: 'w-1' });
      prisma.widget.delete.mockResolvedValue({ id: 'w-1' });
      const result = await service.remove('w-1');
      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
