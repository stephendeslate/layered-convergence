import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';

function createMockPrisma(currentStatus = 'pending') {
  return {
    syncRun: {
      create: async (args: any) => ({ id: 'sr-1', ...args.data }),
      findMany: async () => [{ id: 'sr-1', status: currentStatus }],
      findUniqueOrThrow: async () => ({ id: 'sr-1', status: currentStatus }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
    },
  } as any;
}

describe('SyncRunService', () => {
  let service: SyncRunService;

  beforeEach(() => {
    service = new SyncRunService(createMockPrisma());
  });

  it('should create a sync run with pending status', async () => {
    const result = await service.create({ dataSourceId: 'ds-1' });
    expect(result.status).toBe('pending');
  });

  it('should find all sync runs', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find sync runs by data source', async () => {
    const result = await service.findAll('ds-1');
    expect(result).toBeDefined();
  });

  it('should find one sync run', async () => {
    const result = await service.findOne('sr-1');
    expect(result.id).toBe('sr-1');
  });

  it('should allow valid transition pending -> running', async () => {
    const result = await service.updateStatus('sr-1', { status: 'running' });
    expect(result.status).toBe('running');
  });

  it('should reject invalid transition pending -> completed', async () => {
    await expect(
      service.updateStatus('sr-1', { status: 'completed' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition pending -> failed', async () => {
    await expect(
      service.updateStatus('sr-1', { status: 'failed' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow running -> completed', async () => {
    service = new SyncRunService(createMockPrisma('running'));
    const result = await service.updateStatus('sr-1', { status: 'completed', rowsIngested: 100 });
    expect(result.status).toBe('completed');
  });

  it('should allow running -> failed', async () => {
    service = new SyncRunService(createMockPrisma('running'));
    const result = await service.updateStatus('sr-1', {
      status: 'failed',
      errorLog: 'Connection timeout',
    });
    expect(result.status).toBe('failed');
  });

  it('should allow failed -> pending (retry)', async () => {
    service = new SyncRunService(createMockPrisma('failed'));
    const result = await service.updateStatus('sr-1', { status: 'pending' });
    expect(result.status).toBe('pending');
  });

  it('should reject completed -> any', async () => {
    service = new SyncRunService(createMockPrisma('completed'));
    await expect(
      service.updateStatus('sr-1', { status: 'running' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should get sync history for a data source', async () => {
    const result = await service.getHistory('ds-1');
    expect(result).toBeDefined();
  });

  it('should delete a sync run', async () => {
    const result = await service.remove('sr-1');
    expect(result.id).toBe('sr-1');
  });

  it('should set startedAt when transitioning to running', async () => {
    const result = await service.updateStatus('sr-1', { status: 'running' });
    expect(result.startedAt).toBeDefined();
  });
});
