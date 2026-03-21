import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      count: ReturnType<typeof vi.fn>;
    };
  };

  const mockWidget = {
    id: 'w-1',
    dashboardId: 'dash-1',
    type: 'bar-chart',
    config: { dataSourceId: 'ds-1' },
    position: 0,
    width: 6,
    height: 4,
  };

  beforeEach(async () => {
    prisma = {
      widget: {
        create: vi.fn().mockResolvedValue(mockWidget),
        findMany: vi.fn().mockResolvedValue([mockWidget]),
        findFirst: vi.fn().mockResolvedValue(mockWidget),
        update: vi.fn().mockResolvedValue({ ...mockWidget, type: 'line-chart' }),
        delete: vi.fn().mockResolvedValue(mockWidget),
        count: vi.fn().mockResolvedValue(5),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a widget', async () => {
    const result = await service.create({
      dashboardId: 'dash-1',
      type: 'bar-chart',
    });
    expect(result.id).toBe('w-1');
  });

  it('should default config to empty object', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'bar-chart' });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ config: {} }),
    });
  });

  it('should default position to 0', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'bar-chart' });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ position: 0 }),
    });
  });

  it('should default width to 6 and height to 4', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'bar-chart' });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ width: 6, height: 4 }),
    });
  });

  it('should find widgets by dashboard id ordered by position', async () => {
    const result = await service.findByDashboardId('dash-1');
    expect(result).toHaveLength(1);
    expect(prisma.widget.findMany).toHaveBeenCalledWith({
      where: { dashboardId: 'dash-1' },
      orderBy: { position: 'asc' },
    });
  });

  it('should find one widget by id', async () => {
    const result = await service.findOne('w-1');
    expect(result.id).toBe('w-1');
  });

  it('should throw NotFoundException when widget not found', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a widget', async () => {
    const result = await service.update('w-1', { type: 'line-chart' });
    expect(result.type).toBe('line-chart');
  });

  it('should throw NotFoundException when updating non-existent widget', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', { type: 'x' })).rejects.toThrow(NotFoundException);
  });

  it('should remove a widget', async () => {
    await service.remove('w-1');
    expect(prisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } });
  });

  it('should throw NotFoundException when removing non-existent widget', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });

  it('should count widgets by dashboard id', async () => {
    const count = await service.countByDashboardId('dash-1');
    expect(count).toBe(5);
    expect(prisma.widget.count).toHaveBeenCalledWith({ where: { dashboardId: 'dash-1' } });
  });
});
