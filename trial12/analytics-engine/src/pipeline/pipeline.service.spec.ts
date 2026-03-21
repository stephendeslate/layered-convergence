import { PipelineService } from './pipeline.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PipelineService', () => {
  let service: PipelineService;
  let mockPrisma: any;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockPrisma = {
      dataSource: { findFirst: vi.fn() },
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
    service = new PipelineService(mockPrisma);
  });

  describe('startSync', () => {
    it('should create a RUNNING sync run', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1' });
      mockPrisma.syncRun.create.mockResolvedValue({
        id: 'sr1',
        status: 'RUNNING',
      });
      const result = await service.startSync(tenantId, 'ds1');
      expect(result.status).toBe('RUNNING');
    });

    it('should throw if data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.startSync(tenantId, 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSyncStatus', () => {
    it('should transition RUNNING to COMPLETED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr1',
        status: 'COMPLETED',
      });
      const result = await service.updateSyncStatus(
        'sr1',
        'COMPLETED' as any,
        100,
      );
      expect(result.status).toBe('COMPLETED');
    });

    it('should transition RUNNING to FAILED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr1',
        status: 'FAILED',
      });
      const result = await service.updateSyncStatus(
        'sr1',
        'FAILED' as any,
        0,
        'error msg',
      );
      expect(result.status).toBe('FAILED');
    });

    it('should reject invalid transitions', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'COMPLETED',
      });
      await expect(
        service.updateSyncStatus('sr1', 'RUNNING' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if sync run not found', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue(null);
      await expect(
        service.updateSyncStatus('x', 'COMPLETED' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDeadLetterEvent', () => {
    it('should create a dead letter event', async () => {
      mockPrisma.deadLetterEvent.create.mockResolvedValue({ id: 'dle1' });
      const result = await service.createDeadLetterEvent(
        'ds1',
        { data: 'bad' },
        'parse error',
      );
      expect(result).toBeDefined();
    });
  });

  describe('retryDeadLetterEvent', () => {
    it('should mark as retried', async () => {
      mockPrisma.deadLetterEvent.findUnique.mockResolvedValue({ id: 'dle1' });
      mockPrisma.deadLetterEvent.update.mockResolvedValue({
        id: 'dle1',
        retriedAt: new Date(),
      });
      const result = await service.retryDeadLetterEvent('dle1');
      expect(result.retriedAt).toBeDefined();
    });

    it('should throw if not found', async () => {
      mockPrisma.deadLetterEvent.findUnique.mockResolvedValue(null);
      await expect(service.retryDeadLetterEvent('x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
