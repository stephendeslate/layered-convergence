import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncService } from './sync.service';

const mockPrisma = {
  dataSource: {
    findFirst: vi.fn(),
  },
  syncRun: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  deadLetterEvent: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
};

const mockSyncQueue = {
  add: vi.fn().mockResolvedValue(undefined),
};

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SyncService(mockPrisma as any, mockSyncQueue as any);
  });

  describe('getSyncHistory', () => {
    it('should return paginated sync runs with duration', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      const startedAt = new Date('2024-01-01T10:00:00Z');
      const completedAt = new Date('2024-01-01T10:05:00Z');
      mockPrisma.syncRun.findMany.mockResolvedValue([
        {
          id: 'sr-1',
          status: 'COMPLETED',
          rowsSynced: 100,
          rowsFailed: 0,
          errorMessage: null,
          startedAt,
          completedAt,
          createdAt: startedAt,
        },
      ]);

      const result = await service.getSyncHistory('ds-1', 'tenant-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].durationMs).toBe(300_000); // 5 minutes
      expect(result.meta.pagination.hasMore).toBe(false);
    });

    it('should throw NotFoundException if data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.getSyncHistory('nonexistent', 'tenant-1'),
      ).rejects.toThrow('Data source not found');
    });

    it('should handle pagination with cursor', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      // Return limit+1 items to indicate more pages
      const items = Array.from({ length: 3 }, (_, i) => ({
        id: `sr-${i}`,
        status: 'COMPLETED',
        rowsSynced: 10,
        rowsFailed: 0,
        errorMessage: null,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
      }));
      mockPrisma.syncRun.findMany.mockResolvedValue(items);

      const result = await service.getSyncHistory('ds-1', 'tenant-1', {
        limit: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.pagination.hasMore).toBe(true);
      expect(result.meta.pagination.cursor).toBe('sr-1');
    });

    it('should compute null duration when timestamps are missing', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.syncRun.findMany.mockResolvedValue([
        {
          id: 'sr-1',
          status: 'RUNNING',
          rowsSynced: 0,
          rowsFailed: 0,
          errorMessage: null,
          startedAt: new Date(),
          completedAt: null,
          createdAt: new Date(),
        },
      ]);

      const result = await service.getSyncHistory('ds-1', 'tenant-1');

      expect(result.data[0].durationMs).toBeNull();
    });
  });

  describe('getSyncRun', () => {
    it('should return detailed sync run with dead letter events', async () => {
      const startedAt = new Date('2024-01-01T10:00:00Z');
      const completedAt = new Date('2024-01-01T10:02:00Z');
      mockPrisma.syncRun.findFirst.mockResolvedValue({
        id: 'sr-1',
        status: 'COMPLETED',
        startedAt,
        completedAt,
        deadLetterEvents: [],
        dataSource: { id: 'ds-1', name: 'My Source', connectorType: 'REST_API' },
      });

      const result = await service.getSyncRun('sr-1', 'tenant-1');

      expect(result.id).toBe('sr-1');
      expect(result.durationMs).toBe(120_000);
      expect(result.dataSource.name).toBe('My Source');
    });

    it('should throw NotFoundException if sync run not found', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(
        service.getSyncRun('nonexistent', 'tenant-1'),
      ).rejects.toThrow('Sync run not found');
    });
  });

  describe('getDeadLetterEvents', () => {
    it('should return paginated dead letter events', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.deadLetterEvent.findMany.mockResolvedValue([
        { id: 'dle-1', payload: { row: 1 } },
      ]);

      const result = await service.getDeadLetterEvents('ds-1', 'tenant-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.pagination.hasMore).toBe(false);
    });

    it('should throw NotFoundException if data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.getDeadLetterEvents('nonexistent', 'tenant-1'),
      ).rejects.toThrow('Data source not found');
    });
  });

  describe('retryDeadLetterEvent', () => {
    it('should enqueue retry job and delete the dead letter event', async () => {
      mockPrisma.deadLetterEvent.findFirst.mockResolvedValue({
        id: 'dle-1',
        dataSourceId: 'ds-1',
        tenantId: 'tenant-1',
        payload: { row: 1 },
      });
      mockPrisma.deadLetterEvent.delete.mockResolvedValue({});

      const result = await service.retryDeadLetterEvent('dle-1', 'tenant-1');

      expect(result.message).toContain('queued for retry');
      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        'dead-letter-retry',
        expect.objectContaining({
          deadLetterEventId: 'dle-1',
          dataSourceId: 'ds-1',
        }),
        expect.any(Object),
      );
      expect(mockPrisma.deadLetterEvent.delete).toHaveBeenCalledWith({
        where: { id: 'dle-1' },
      });
    });

    it('should throw NotFoundException if dead letter event not found', async () => {
      mockPrisma.deadLetterEvent.findFirst.mockResolvedValue(null);

      await expect(
        service.retryDeadLetterEvent('nonexistent', 'tenant-1'),
      ).rejects.toThrow('Dead letter event not found');
    });
  });

  describe('retryAllDeadLetters', () => {
    it('should enqueue all dead letter events and delete them', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.deadLetterEvent.findMany.mockResolvedValue([
        { id: 'dle-1', dataSourceId: 'ds-1', tenantId: 'tenant-1', payload: {} },
        { id: 'dle-2', dataSourceId: 'ds-1', tenantId: 'tenant-1', payload: {} },
      ]);
      mockPrisma.deadLetterEvent.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.retryAllDeadLetters('ds-1', 'tenant-1');

      expect(result.count).toBe(2);
      expect(mockSyncQueue.add).toHaveBeenCalledTimes(2);
    });

    it('should return count 0 when no dead letter events exist', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.deadLetterEvent.findMany.mockResolvedValue([]);

      const result = await service.retryAllDeadLetters('ds-1', 'tenant-1');

      expect(result.count).toBe(0);
      expect(mockSyncQueue.add).not.toHaveBeenCalled();
    });
  });
});
