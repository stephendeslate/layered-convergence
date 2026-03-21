import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PipelineService } from './pipeline.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  dataSource: {
    findFirst: vi.fn(),
  },
  syncRun: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  deadLetterEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PipelineService(mockPrisma as any);
  });

  describe('startSync', () => {
    it('should create a RUNNING sync run', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.syncRun.create.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      const result = await service.startSync('tenant-1', 'ds-1');
      expect(result.status).toBe('RUNNING');
    });

    it('should throw NotFoundException if data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.startSync('tenant-1', 'ds-x')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should scope data source lookup by tenantId', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.syncRun.create.mockResolvedValue({ id: 'sr-1' });
      await service.startSync('tenant-1', 'ds-1');
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId: 'tenant-1' },
      });
    });
  });

  describe('updateSyncStatus', () => {
    it('should transition RUNNING to COMPLETED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr-1',
        status: 'COMPLETED',
      });
      const result = await service.updateSyncStatus(
        'sr-1',
        'COMPLETED' as any,
        100,
      );
      expect(result.status).toBe('COMPLETED');
    });

    it('should transition RUNNING to FAILED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr-1',
        status: 'FAILED',
      });
      const result = await service.updateSyncStatus(
        'sr-1',
        'FAILED' as any,
        0,
        'connection timeout',
      );
      expect(result.status).toBe('FAILED');
    });

    it('should reject COMPLETED to RUNNING transition', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'COMPLETED',
      });
      await expect(
        service.updateSyncStatus('sr-1', 'RUNNING' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED to RUNNING transition', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'FAILED',
      });
      await expect(
        service.updateSyncStatus('sr-1', 'RUNNING' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED to COMPLETED transition', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'COMPLETED',
      });
      await expect(
        service.updateSyncStatus('sr-1', 'COMPLETED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED to COMPLETED transition', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'FAILED',
      });
      await expect(
        service.updateSyncStatus('sr-1', 'COMPLETED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if sync run not found', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue(null);
      await expect(
        service.updateSyncStatus('nonexistent', 'COMPLETED' as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set completedAt on COMPLETED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockImplementation(({ data }) => data);
      const result = await service.updateSyncStatus(
        'sr-1',
        'COMPLETED' as any,
      );
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should set completedAt on FAILED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockImplementation(({ data }) => data);
      const result = await service.updateSyncStatus('sr-1', 'FAILED' as any);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should include rowsIngested in update', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({});
      await service.updateSyncStatus('sr-1', 'COMPLETED' as any, 50);
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rowsIngested: 50 }),
        }),
      );
    });

    it('should include errorLog in update', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({});
      await service.updateSyncStatus('sr-1', 'FAILED' as any, 0, 'err');
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ errorLog: 'err' }),
        }),
      );
    });
  });

  describe('getSyncRuns', () => {
    it('should return sync runs for data source', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([{ id: 'sr-1' }]);
      const result = await service.getSyncRuns('ds-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getSyncRun', () => {
    it('should return sync run by id', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({ id: 'sr-1' });
      const result = await service.getSyncRun('sr-1');
      expect(result.id).toBe('sr-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue(null);
      await expect(service.getSyncRun('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createDeadLetterEvent', () => {
    it('should create a dead letter event', async () => {
      mockPrisma.deadLetterEvent.create.mockResolvedValue({
        id: 'dle-1',
        payload: { data: 'bad' },
      });
      const result = await service.createDeadLetterEvent(
        'ds-1',
        { data: 'bad' },
        'parse error',
      );
      expect(result.id).toBe('dle-1');
    });
  });

  describe('getDeadLetterEvents', () => {
    it('should return dead letter events', async () => {
      mockPrisma.deadLetterEvent.findMany.mockResolvedValue([{ id: 'dle-1' }]);
      const result = await service.getDeadLetterEvents('ds-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('retryDeadLetterEvent', () => {
    it('should update retriedAt', async () => {
      mockPrisma.deadLetterEvent.findUnique.mockResolvedValue({ id: 'dle-1' });
      mockPrisma.deadLetterEvent.update.mockResolvedValue({
        id: 'dle-1',
        retriedAt: new Date(),
      });
      const result = await service.retryDeadLetterEvent('dle-1');
      expect(result.retriedAt).toBeDefined();
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.deadLetterEvent.findUnique.mockResolvedValue(null);
      await expect(
        service.retryDeadLetterEvent('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
