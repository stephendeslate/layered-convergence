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
        update: vi.fn().mockImplementation(({ data }) => ({
          ...mockWidget,
          ...data,
        })),
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
      type: 'bar',
    });
    expect(result.id).toBe('w-1');
  });

  it('should use default config when not provided', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'line' });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ config: {} }),
    });
  });

  it('should use default position when not provided', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'pie' });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ position: 0 }),
    });
  });

  it('should use default width and height when not provided', async () => {
    await service.create({ dashboardId: 'dash-1', type: 'kpi' });
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ width: 6, height: 4 }),
    });
  });

  it('should find widgets by dashboard id ordered by position', async () => {
    await service.findByDashboardId('dash-1');
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
    const result = await service.update('w-1', { position: 3 });
    expect(result.position).toBe(3);
  });

  it('should throw NotFoundException when updating non-existent widget', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', { position: 1 })).rejects.toThrow(NotFoundException);
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
    const result = await service.countByDashboardId('dash-1');
    expect(result).toBe(5);
  });
});
