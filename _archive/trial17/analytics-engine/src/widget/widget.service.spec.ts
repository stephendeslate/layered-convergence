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
    id: 'w-1',
    dashboardId: 'dash-1',
    type: 'line',
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
        update: vi.fn().mockResolvedValue({ ...mockWidget, type: 'bar' }),
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

  it('should create a widget', async () => {
    const result = await service.create({
      dashboardId: 'dash-1',
      type: 'line',
    });
    expect(result).toEqual(mockWidget);
  });

  it('should create widget with defaults', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'bar' });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: {
        dashboardId: 'dash-1',
        type: 'bar',
        config: {},
        position: 0,
        width: 6,
        height: 4,
      },
    });
  });

  it('should find widgets by dashboard id', async () => {
    const result = await service.findByDashboardId('dash-1');
    expect(result).toHaveLength(1);
  });

  it('should find one widget', async () => {
    const result = await service.findOne('w-1');
    expect(result).toEqual(mockWidget);
  });

  it('should throw NotFoundException if widget not found', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.findOne('w-999')).rejects.toThrow(NotFoundException);
  });

  it('should update a widget', async () => {
    const result = await service.update('w-1', { type: 'bar' });
    expect(result.type).toBe('bar');
  });

  it('should delete a widget', async () => {
    const result = await service.remove('w-1');
    expect(result).toEqual(mockWidget);
  });

  it('should throw NotFoundException on delete if not found', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.remove('w-999')).rejects.toThrow(NotFoundException);
  });
});
