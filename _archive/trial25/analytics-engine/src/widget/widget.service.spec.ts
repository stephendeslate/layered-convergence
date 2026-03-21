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
    };
  };

  const mockWidget = {
    id: 'widget-1',
    dashboardId: 'dash-1',
    type: 'bar',
    config: {},
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
        update: vi.fn().mockResolvedValue({ ...mockWidget, position: 1 }),
        delete: vi.fn().mockResolvedValue(mockWidget),
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

  it('should create a widget with defaults', async () => {
    const result = await service.create({ dashboardId: 'dash-1', type: 'bar' });
    expect(result).toEqual(mockWidget);
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: { dashboardId: 'dash-1', type: 'bar', config: {}, position: 0, width: 6, height: 4 },
    });
  });

  it('should create a widget with custom values', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'line', config: { x: 'time' }, position: 3, width: 12, height: 8 });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: { dashboardId: 'dash-1', type: 'line', config: { x: 'time' }, position: 3, width: 12, height: 8 },
    });
  });

  it('should find widgets by dashboard id ordered by position', async () => {
    const result = await service.findByDashboardId('dash-1');
    expect(result).toEqual([mockWidget]);
    expect(prisma.widget.findMany).toHaveBeenCalledWith({
      where: { dashboardId: 'dash-1' },
      orderBy: { position: 'asc' },
    });
  });

  it('should find one widget', async () => {
    const result = await service.findOne('widget-1');
    expect(result).toEqual(mockWidget);
  });

  it('should throw NotFoundException when widget not found', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a widget', async () => {
    const result = await service.update('widget-1', { position: 1 });
    expect(result.position).toBe(1);
  });

  it('should update a widget config', async () => {
    await service.update('widget-1', { config: { x: 'date' } });
    const callArgs = prisma.widget.update.mock.calls[0][0];
    expect(callArgs.data.config).toEqual({ x: 'date' });
  });

  it('should remove a widget', async () => {
    const result = await service.remove('widget-1');
    expect(result).toEqual(mockWidget);
  });

  it('should throw NotFoundException when removing non-existent widget', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when updating non-existent widget', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', { position: 1 })).rejects.toThrow(NotFoundException);
  });
});
