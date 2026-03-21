import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';

describe('PipelineService', () => {
  let service: PipelineService;
  let mockPrisma: any;
  let mockSyncRunService: any;

  const makeDs = (status: string) => ({
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'Test Source',
    type: 'api',
    status,
  });

  beforeEach(() => {
    mockPrisma = {
      dataSource: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    mockSyncRunService = {
      create: vi.fn().mockResolvedValue({ id: 'run-1' }),
      complete: vi.fn().mockResolvedValue({}),
      fail: vi.fn().mockResolvedValue({}),
    };
    service = new PipelineService(mockPrisma, mockSyncRunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return the data source status', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('IDLE'));
      const result = await service.getStatus('ds-1');
      expect(result).toEqual({ id: 'ds-1', status: 'IDLE' });
    });

    it('should throw NotFoundException when data source not found', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.getStatus('ds-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition - valid transitions', () => {
    it('should allow IDLE -> RUNNING', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('IDLE'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('RUNNING'));
      const result = await service.transition('ds-1', 'RUNNING' as any);
      expect(result.status).toBe('RUNNING');
    });

    it('should allow RUNNING -> COMPLETED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('RUNNING'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('COMPLETED'));
      const result = await service.transition('ds-1', 'COMPLETED' as any);
      expect(result.status).toBe('COMPLETED');
    });

    it('should allow RUNNING -> FAILED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('RUNNING'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('FAILED'));
      const result = await service.transition('ds-1', 'FAILED' as any);
      expect(result.status).toBe('FAILED');
    });

    it('should allow COMPLETED -> RUNNING (re-run)', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('COMPLETED'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('RUNNING'));
      const result = await service.transition('ds-1', 'RUNNING' as any);
      expect(result.status).toBe('RUNNING');
    });

    it('should allow FAILED -> RUNNING (retry)', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('FAILED'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('RUNNING'));
      const result = await service.transition('ds-1', 'RUNNING' as any);
      expect(result.status).toBe('RUNNING');
    });
  });

  describe('transition - invalid transitions', () => {
    it('should reject IDLE -> COMPLETED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('IDLE'));
      await expect(service.transition('ds-1', 'COMPLETED' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject IDLE -> FAILED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('IDLE'));
      await expect(service.transition('ds-1', 'FAILED' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject RUNNING -> IDLE', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('RUNNING'));
      await expect(service.transition('ds-1', 'IDLE' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> COMPLETED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('COMPLETED'));
      await expect(service.transition('ds-1', 'COMPLETED' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> IDLE', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('COMPLETED'));
      await expect(service.transition('ds-1', 'IDLE' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> COMPLETED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('FAILED'));
      await expect(service.transition('ds-1', 'COMPLETED' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> IDLE', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('FAILED'));
      await expect(service.transition('ds-1', 'IDLE' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> FAILED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('COMPLETED'));
      await expect(service.transition('ds-1', 'FAILED' as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> FAILED', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('FAILED'));
      await expect(service.transition('ds-1', 'FAILED' as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('trigger', () => {
    it('should trigger a pipeline run', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('IDLE'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('RUNNING'));
      const result = await service.trigger('tenant-1', 'ds-1');
      expect(result.status).toBe('RUNNING');
      expect(result.syncRunId).toBe('run-1');
    });

    it('should throw NotFoundException when tenant does not own data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('IDLE'));
      await expect(service.trigger('other-tenant', 'ds-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when data source not found', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.trigger('tenant-1', 'ds-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete a pipeline run', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('RUNNING'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('COMPLETED'));
      const result = await service.complete('ds-1', 'run-1', 100);
      expect(result.status).toBe('COMPLETED');
      expect(result.rowsIngested).toBe(100);
    });
  });

  describe('fail', () => {
    it('should fail a pipeline run', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(makeDs('RUNNING'));
      mockPrisma.dataSource.update.mockResolvedValue(makeDs('FAILED'));
      const result = await service.fail('ds-1', 'run-1', 'Timeout');
      expect(result.status).toBe('FAILED');
      expect(result.errorLog).toBe('Timeout');
    });
  });
});
