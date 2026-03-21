import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SyncRunService', () => {
  let service: SyncRunService;
  let prisma: {
    syncRun: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
  };

  const mockRun = {
    id: 'run-1',
    dataSourceId: 'ds-1',
    status: 'running',
    rowsIngested: 0,
  };

  beforeEach(async () => {
    prisma = {
      syncRun: {
        create: vi.fn().mockResolvedValue(mockRun),
        findMany: vi.fn().mockResolvedValue([mockRun]),
        findFirst: vi.fn().mockResolvedValue(mockRun),
        update: vi.fn().mockResolvedValue({ ...mockRun, status: 'completed' }),
        count: vi.fn().mockResolvedValue(5),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        SyncRunService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SyncRunService>(SyncRunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a sync run with default status', async () => {
    await service.create({ dataSourceId: 'ds-1' });
    expect(prisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds-1', status: 'running' },
    });
  });

  it('should create a sync run with custom status', async () => {
    await service.create({ dataSourceId: 'ds-1', status: 'pending' });
    expect(prisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds-1', status: 'pending' },
    });
  });

  it('should find runs by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result).toHaveLength(1);
    expect(prisma.syncRun.findMany).toHaveBeenCalledWith({
      where: { dataSourceId: 'ds-1' },
      orderBy: { startedAt: 'desc' },
    });
  });

  it('should find one run by id', async () => {
    const result = await service.findOne('run-1');
    expect(result.id).toBe('run-1');
  });

  it('should throw NotFoundException when run not found', async () => {
    prisma.syncRun.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a sync run', async () => {
    const result = await service.update('run-1', { status: 'completed', rowsIngested: 100 });
    expect(result.status).toBe('completed');
  });

  it('should set completedAt on completed status', async () => {
    await service.update('run-1', { status: 'completed' });
    expect(prisma.syncRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ completedAt: expect.any(Date) }),
      }),
    );
  });

  it('should set completedAt on failed status', async () => {
    await service.update('run-1', { status: 'failed', errorLog: 'timeout' });
    expect(prisma.syncRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ completedAt: expect.any(Date) }),
      }),
    );
  });

  it('should throw NotFoundException when updating non-existent run', async () => {
    prisma.syncRun.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', { status: 'completed' })).rejects.toThrow(NotFoundException);
  });

  it('should count runs by data source id', async () => {
    const count = await service.countByDataSourceId('ds-1');
    expect(count).toBe(5);
  });
});
