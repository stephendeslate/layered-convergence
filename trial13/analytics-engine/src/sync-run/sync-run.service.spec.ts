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
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new SyncRunService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sync run with running status', async () => {
      mockPrisma.syncRun.create.mockResolvedValue(mockRun);
      const result = await service.create('ds-1');
      expect(result.status).toBe('running');
      expect(mockPrisma.syncRun.create).toHaveBeenCalledWith({
        data: { dataSourceId: 'ds-1', status: 'running' },
      });
    });
  });

  describe('findByDataSource', () => {
    it('should return runs ordered by startedAt desc', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([mockRun]);
      const result = await service.findByDataSource('ds-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds-1' },
        orderBy: { startedAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a sync run', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue(mockRun);
      const result = await service.findOne('run-1');
      expect(result).toEqual(mockRun);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue(null);
      await expect(service.findOne('run-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should mark run as completed with row count', async () => {
      mockPrisma.syncRun.update.mockResolvedValue({ ...mockRun, status: 'completed', rowsIngested: 42 });
      const result = await service.complete('run-1', 42);
      expect(result.status).toBe('completed');
      expect(result.rowsIngested).toBe(42);
    });
  });

  describe('fail', () => {
    it('should mark run as failed with error log', async () => {
      mockPrisma.syncRun.update.mockResolvedValue({ ...mockRun, status: 'failed', errorLog: 'Connection refused' });
      const result = await service.fail('run-1', 'Connection refused');
      expect(result.status).toBe('failed');
      expect(result.errorLog).toBe('Connection refused');
    });
  });
});
