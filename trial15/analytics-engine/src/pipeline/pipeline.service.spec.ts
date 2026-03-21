import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';

const PipelineStatus = {
  IDLE: 'IDLE' as const,
  RUNNING: 'RUNNING' as const,
  COMPLETED: 'COMPLETED' as const,
  FAILED: 'FAILED' as const,
};

const mockPrisma = {
  pipeline: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PipelineService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a pipeline with IDLE status', async () => {
      const data = { name: 'ETL Pipeline', dataSourceId: 'ds-1' };
      const expected = { id: 'pipe-1', ...data, tenantId: 'tenant-1', status: 'IDLE' };
      mockPrisma.pipeline.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', data);

      expect(result).toEqual(expected);
      expect(mockPrisma.pipeline.create).toHaveBeenCalledWith({
        data: {
          name: 'ETL Pipeline',
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          status: 'IDLE',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all pipelines for a tenant', async () => {
      mockPrisma.pipeline.findMany.mockResolvedValue([{ id: 'pipe-1' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual([{ id: 'pipe-1' }]);
    });
  });

  describe('findOne', () => {
    it('should return a pipeline by id and tenantId', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({ id: 'pipe-1', status: 'IDLE' });

      const result = await service.findOne('tenant-1', 'pipe-1');

      expect(result.id).toBe('pipe-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'pipe-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transition (state machine)', () => {
    it('should transition IDLE → RUNNING', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.IDLE,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.RUNNING,
      });

      const result = await service.transition(
        'tenant-1',
        'pipe-1',
        PipelineStatus.RUNNING,
      );

      expect(result.status).toBe('RUNNING');
    });

    it('should transition RUNNING → COMPLETED', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.RUNNING,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.COMPLETED,
      });

      const result = await service.transition(
        'tenant-1',
        'pipe-1',
        PipelineStatus.COMPLETED,
      );

      expect(result.status).toBe('COMPLETED');
    });

    it('should transition RUNNING → FAILED with error message', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.RUNNING,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.FAILED,
        errorMessage: 'Connection timeout',
      });

      const result = await service.transition(
        'tenant-1',
        'pipe-1',
        PipelineStatus.FAILED,
        'Connection timeout',
      );

      expect(result.status).toBe('FAILED');
    });

    it('should transition COMPLETED → IDLE', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.COMPLETED,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.IDLE,
      });

      const result = await service.transition(
        'tenant-1',
        'pipe-1',
        PipelineStatus.IDLE,
      );

      expect(result.status).toBe('IDLE');
    });

    it('should transition FAILED → IDLE', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.FAILED,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.IDLE,
      });

      const result = await service.transition(
        'tenant-1',
        'pipe-1',
        PipelineStatus.IDLE,
      );

      expect(result.status).toBe('IDLE');
    });

    it('should reject IDLE → COMPLETED (invalid)', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.IDLE,
      });

      await expect(
        service.transition('tenant-1', 'pipe-1', PipelineStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject IDLE → FAILED (invalid)', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.IDLE,
      });

      await expect(
        service.transition('tenant-1', 'pipe-1', PipelineStatus.FAILED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED → RUNNING (invalid)', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.COMPLETED,
      });

      await expect(
        service.transition('tenant-1', 'pipe-1', PipelineStatus.RUNNING),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RUNNING → IDLE (invalid)', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.RUNNING,
      });

      await expect(
        service.transition('tenant-1', 'pipe-1', PipelineStatus.IDLE),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED → RUNNING (invalid)', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.FAILED,
      });

      await expect(
        service.transition('tenant-1', 'pipe-1', PipelineStatus.RUNNING),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('trigger', () => {
    it('should trigger a pipeline (IDLE → RUNNING)', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.IDLE,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.RUNNING,
      });

      const result = await service.trigger('tenant-1', 'pipe-1');

      expect(result.status).toBe('RUNNING');
    });
  });

  describe('complete', () => {
    it('should complete a pipeline (RUNNING → COMPLETED)', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.RUNNING,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.COMPLETED,
      });

      const result = await service.complete('tenant-1', 'pipe-1');

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('fail', () => {
    it('should fail a pipeline with error message', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.RUNNING,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.FAILED,
        errorMessage: 'Timeout',
      });

      const result = await service.fail('tenant-1', 'pipe-1', 'Timeout');

      expect(result.status).toBe('FAILED');
    });
  });

  describe('reset', () => {
    it('should reset a pipeline to IDLE', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.COMPLETED,
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        status: PipelineStatus.IDLE,
      });

      const result = await service.reset('tenant-1', 'pipe-1');

      expect(result.status).toBe('IDLE');
    });
  });

  describe('remove', () => {
    it('should delete a pipeline', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({ id: 'pipe-1' });
      mockPrisma.pipeline.delete.mockResolvedValue({ id: 'pipe-1' });

      const result = await service.remove('tenant-1', 'pipe-1');

      expect(result).toEqual({ id: 'pipe-1' });
    });

    it('should throw NotFoundException if pipeline not found', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'pipe-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
