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

  it('should return all dashboards for a tenant', async () => {
    const dashboards = [{ id: 'd1', tenantId: 't1', name: 'Main' }];
    prisma.dashboard.findMany.mockResolvedValue(dashboards);

    const result = await service.findAll('t1');

    expect(result).toEqual(dashboards);
    expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a dashboard', async () => {
    const created = { id: 'd1', tenantId: 't1', name: 'New', isPublic: false };
    prisma.dashboard.create.mockResolvedValue(created);

    const result = await service.create('t1', { name: 'New' });

    expect(result).toEqual(created);
  });

  it('should update a dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1' });
    prisma.dashboard.update.mockResolvedValue({ id: 'd1', name: 'Updated' });

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
