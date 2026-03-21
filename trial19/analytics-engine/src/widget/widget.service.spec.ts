import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: {
    widget: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      widget: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new WidgetService(prisma as unknown as PrismaService);
  });

  it('should find all widgets for a tenant', async () => {
    prisma.widget.findMany.mockResolvedValue([]);
    const result = await service.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should filter widgets by dashboardId', async () => {
    prisma.widget.findMany.mockResolvedValue([]);
    await service.findAll('t1', 'd1');
    expect(prisma.widget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1', dashboardId: 'd1' } }),
    );
  });

  it('should throw NotFoundException when widget not found', async () => {
    prisma.widget.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a widget', async () => {
    const created = { id: 'w1', title: 'Test', type: 'CHART', tenantId: 't1' };
    prisma.widget.create.mockResolvedValue(created);

    const result = await service.create('t1', { dashboardId: 'd1', type: 'CHART' as never, title: 'Test' });
    expect(result.title).toBe('Test');
  });

  it('should delete a widget', async () => {
    prisma.widget.findFirst.mockResolvedValue({ id: 'w1', tenantId: 't1' });
    prisma.widget.delete.mockResolvedValue({ id: 'w1' });

    await service.remove('t1', 'w1');
    expect(prisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
  });
});
