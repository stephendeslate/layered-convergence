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

  const mockSyncRun = {
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
        create: vi.fn().mockResolvedValue(mockSyncRun),
        findMany: vi.fn().mockResolvedValue([mockSyncRun]),
        findFirst: vi.fn().mockResolvedValue(mockSyncRun),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...mockSyncRun,
          ...data,
        })),
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

  it('should create a sync run', async () => {
    const result = await service.create({ dataSourceId: 'ds-1' });
    expect(result.status).toBe('running');
  });

  it('should create a sync run with custom status', async () => {
    await service.create({ dataSourceId: 'ds-1', status: 'pending' });
    expect(prisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds-1', status: 'pending' },
    });
  });

  it('should find sync runs by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result).toHaveLength(1);
  });

  it('should find one sync run', async () => {
    const result = await service.findOne('run-1');
    expect(result).toEqual(mockSyncRun);
  });

  it('should throw NotFoundException when run not found', async () => {
    prisma.syncRun.findFirst.mockResolvedValue(null);
    await expect(service.findOne('run-999')).rejects.toThrow(NotFoundException);
  });

  it('should update a sync run', async () => {
    const result = await service.update('run-1', {
      status: 'completed',
      rowsIngested: 100,
    });
    expect(result.status).toBe('completed');
  });

  it('should set completedAt when status is completed', async () => {
    await service.update('run-1', { status: 'completed' });
    const call = prisma.syncRun.update.mock.calls[0][0];
    expect(call.data.completedAt).toBeInstanceOf(Date);
  });

  it('should set completedAt when status is failed', async () => {
    await service.update('run-1', { status: 'failed', errorLog: 'error' });
    const call = prisma.syncRun.update.mock.calls[0][0];
    expect(call.data.completedAt).toBeInstanceOf(Date);
  });
});
