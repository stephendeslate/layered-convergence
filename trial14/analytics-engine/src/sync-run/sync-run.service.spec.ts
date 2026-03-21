import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';

describe('SyncRunService', () => {
  let service: SyncRunService;
  let mockPrisma: any;

  const mockRun = {
    id: 'run-1',
    dataSourceId: 'ds-1',
    status: 'running',
    rowsIngested: 0,
    errorLog: null,
    startedAt: new Date(),
    completedAt: null,
  };

  beforeEach(() => {
    mockPrisma = {
      syncRun: {
        create: vi.fn().mockResolvedValue(mockRun),
        findMany: vi.fn().mockResolvedValue([mockRun]),
        findUnique: vi.fn().mockResolvedValue(mockRun),
        update: vi.fn(),
      },
    };
    service = new SyncRunService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a sync run', async () => {
    const result = await service.create('ds-1');
    expect(result.status).toBe('running');
    expect(mockPrisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds-1', status: 'running' },
    });
  });

  it('should find runs by data source', async () => {
    const result = await service.findByDataSource('ds-1');
    expect(result).toHaveLength(1);
  });

  it('should find one run by id', async () => {
    const result = await service.findOne('run-1');
    expect(result.id).toBe('run-1');
  });

  it('should throw NotFoundException when run not found', async () => {
    mockPrisma.syncRun.findUnique.mockResolvedValue(null);
    await expect(service.findOne('run-999')).rejects.toThrow(NotFoundException);
  });

  it('should complete a sync run', async () => {
    mockPrisma.syncRun.update.mockResolvedValue({ ...mockRun, status: 'completed', rowsIngested: 100 });
    const result = await service.complete('run-1', 100);
    expect(result.status).toBe('completed');
    expect(result.rowsIngested).toBe(100);
  });

  it('should fail a sync run', async () => {
    mockPrisma.syncRun.update.mockResolvedValue({ ...mockRun, status: 'failed', errorLog: 'Timeout' });
    const result = await service.fail('run-1', 'Timeout');
    expect(result.status).toBe('failed');
    expect(result.errorLog).toBe('Timeout');
  });

  it('should set completedAt when completing', async () => {
    mockPrisma.syncRun.update.mockResolvedValue({});
    await service.complete('run-1', 50);
    const updateCall = mockPrisma.syncRun.update.mock.calls[0][0];
    expect(updateCall.data.completedAt).toBeInstanceOf(Date);
  });

  it('should set completedAt when failing', async () => {
    mockPrisma.syncRun.update.mockResolvedValue({});
    await service.fail('run-1', 'Error');
    const updateCall = mockPrisma.syncRun.update.mock.calls[0][0];
    expect(updateCall.data.completedAt).toBeInstanceOf(Date);
  });
});
