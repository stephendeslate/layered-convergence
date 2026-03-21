import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
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

  it('should find all sync runs for a tenant', async () => {
    prisma.syncRun.findMany.mockResolvedValue([]);
    const result = await service.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should filter by dataSourceId', async () => {
    prisma.syncRun.findMany.mockResolvedValue([]);
    await service.findAll('t1', 'ds1');
    expect(prisma.syncRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1', dataSourceId: 'ds1' } }),
    );
  });

  it('should throw NotFoundException when sync run not found', async () => {
    prisma.syncRun.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a sync run', async () => {
    const created = { id: 'sr1', status: 'PENDING', tenantId: 't1' };
    prisma.syncRun.create.mockResolvedValue(created);

    const result = await service.create('t1', { dataSourceId: 'ds1' });
    expect(result.status).toBe('PENDING');
  });

  it('should transition PENDING to RUNNING', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', status: 'PENDING', tenantId: 't1' });
    prisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'RUNNING' });

    const result = await service.transition('t1', 'sr1', { status: 'RUNNING' as never });
    expect(result.status).toBe('RUNNING');
  });

  it('should reject invalid transition PENDING to COMPLETED', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', status: 'PENDING', tenantId: 't1' });

    await expect(
      service.transition('t1', 'sr1', { status: 'COMPLETED' as never }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject transition from terminal COMPLETED state', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', status: 'COMPLETED', tenantId: 't1' });

    await expect(
      service.transition('t1', 'sr1', { status: 'RUNNING' as never }),
    ).rejects.toThrow(BadRequestException);
  });
});
