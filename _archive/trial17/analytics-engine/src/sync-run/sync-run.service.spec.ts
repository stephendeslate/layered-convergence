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
    };
  };

  const mockRun = {
    id: 'run-1',
    dataSourceId: 'ds-1',
    status: 'running',
    rowsIngested: 0,
    errorLog: null,
    startedAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      syncRun: {
        create: vi.fn().mockResolvedValue(mockRun),
        findMany: vi.fn().mockResolvedValue([mockRun]),
        findFirst: vi.fn().mockResolvedValue(mockRun),
        update: vi.fn().mockResolvedValue({
          ...mockRun,
          status: 'completed',
          completedAt: new Date(),
        }),
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

  it('should create a sync run with default status running', async () => {
    const result = await service.create({ dataSourceId: 'ds-1' });
    expect(result.status).toBe('running');
    expect(prisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds-1', status: 'running' },
    });
  });

  it('should create a sync run with custom status', async () => {
    await service.create({ dataSourceId: 'ds-1', status: 'completed' });
    expect(prisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds-1', status: 'completed' },
    });
  });

  it('should find runs by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result).toHaveLength(1);
  });

  it('should find one run', async () => {
    const result = await service.findOne('run-1');
    expect(result).toEqual(mockRun);
  });

  it('should throw NotFoundException when run not found', async () => {
    prisma.syncRun.findFirst.mockResolvedValue(null);
    await expect(service.findOne('run-999')).rejects.toThrow(NotFoundException);
  });

  it('should update a sync run', async () => {
    const result = await service.update('run-1', { status: 'completed' });
    expect(result.status).toBe('completed');
  });

  it('should set completedAt when status is completed', async () => {
    await service.update('run-1', { status: 'completed' });
    const call = prisma.syncRun.update.mock.calls[0][0];
    expect(call.data.completedAt).toBeDefined();
  });

  it('should set completedAt when status is failed', async () => {
    await service.update('run-1', { status: 'failed' });
    const call = prisma.syncRun.update.mock.calls[0][0];
    expect(call.data.completedAt).toBeDefined();
  });
});
