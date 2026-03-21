import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      dashboard: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new DashboardService(prisma as unknown as PrismaService);
  });

  it('should find all dashboards for a tenant', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);
    const result = await service.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a dashboard', async () => {
    const created = { id: 'd1', name: 'Test', tenantId: 't1', widgets: [], embeds: [] };
    prisma.dashboard.create.mockResolvedValue(created);

    const result = await service.create('t1', { name: 'Test' });
    expect(result.name).toBe('Test');
  });

  it('should update a dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1' });
    prisma.dashboard.update.mockResolvedValue({ id: 'd1', name: 'Updated', widgets: [], embeds: [] });

    const result = await service.update('t1', 'd1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1' });
    prisma.dashboard.delete.mockResolvedValue({ id: 'd1' });

    await service.remove('t1', 'd1');
    expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
  });
});
