import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SyncRunService', () => {
  let service: SyncRunService;
  let prisma: {
    syncRun: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      syncRun: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new SyncRunService(prisma as unknown as PrismaService);
  });

  it('should return sync runs for a tenant', async () => {
    const runs = [{ id: 'sr1', tenantId: 't1', status: 'pending' }];
    prisma.syncRun.findMany.mockResolvedValue(runs);

    const result = await service.findAll('t1');

    expect(result).toEqual(runs);
  });

  it('should throw NotFoundException when sync run not found', async () => {
    prisma.syncRun.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a sync run', async () => {
    const created = { id: 'sr1', tenantId: 't1', dataSourceId: 'ds1', status: 'pending' };
    prisma.syncRun.create.mockResolvedValue(created);

    const result = await service.create('t1', { dataSourceId: 'ds1' });

    expect(result).toEqual(created);
  });

  it('should update a sync run with completedAt on terminal status', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', tenantId: 't1' });
    prisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'completed' });

    await service.update('t1', 'sr1', { status: 'completed', recordsProcessed: 100 });

    expect(prisma.syncRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'completed',
          recordsProcessed: 100,
          completedAt: expect.any(Date),
        }),
      }),
    );
  });
});
