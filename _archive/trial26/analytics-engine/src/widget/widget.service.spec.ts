import { describe, it, expect, beforeEach } from 'vitest';
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a widget with defaults', async () => {
    prisma.widget.create.mockResolvedValue({ id: 'w1', type: 'bar', position: 0 });
    const result = await service.create({ dashboardId: 'd1', type: 'bar' });
    expect(result.type).toBe('bar');
    expect(prisma.widget.create).toHaveBeenCalledWith({
      data: {
        dashboardId: 'd1',
        type: 'bar',
        config: {},
        position: 0,
        width: 6,
        height: 4,
      },
    });
  });

  it('should find widgets by dashboard id', async () => {
    prisma.widget.findMany.mockResolvedValue([{ id: 'w1' }, { id: 'w2' }]);
    const result = await service.findByDashboardId('d1');
    expect(result).toHaveLength(2);
  });

  it('should find one widget', async () => {
    prisma.widget.findFirst.mockResolvedValue({ id: 'w1' });
    const result = await service.findOne('w1');
    expect(result.id).toBe('w1');
  });

  it('should throw NotFoundException when widget not found', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('should update a widget', async () => {
    prisma.widget.findFirst.mockResolvedValue({ id: 'w1', type: 'bar' });
    prisma.widget.update.mockResolvedValue({ id: 'w1', type: 'pie' });
    const result = await service.update('w1', { type: 'pie' });
    expect(result.type).toBe('pie');
  });

  it('should delete a widget', async () => {
    prisma.widget.findFirst.mockResolvedValue({ id: 'w1' });
    prisma.widget.delete.mockResolvedValue({ id: 'w1' });
    await service.remove('w1');
    expect(prisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
  });

  it('should throw NotFoundException when deleting non-existent widget', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
  });
});
