import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';

const PipelineStatus = {
  IDLE: 'IDLE' as const,
  RUNNING: 'RUNNING' as const,
  COMPLETED: 'COMPLETED' as const,
  FAILED: 'FAILED' as const,
};

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: {
    pipeline: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    pipelineStateHistory: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      pipelineStateHistory: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PipelineService);
  });

  describe('create', () => {
    it('should create pipeline with IDLE status', async () => {
      prisma.pipeline.create.mockResolvedValue({ id: 'p-1', status: 'IDLE' });
      const result = await service.create({ dataSourceId: 'ds-1' });
      expect(result.status).toBe('IDLE');
    });
  });

  describe('findOne', () => {
    it('should return pipeline by id', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1' });
      const result = await service.findOne('p-1');
      expect(result.id).toBe('p-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDataSourceId', () => {
    it('should return pipeline by dataSourceId', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', dataSourceId: 'ds-1' });
      const result = await service.findByDataSourceId('ds-1');
      expect(result.dataSourceId).toBe('ds-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);
      await expect(service.findByDataSourceId('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow IDLE -> RUNNING', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({ id: 'p-1', status: PipelineStatus.RUNNING });
      const result = await service.transition('p-1', { status: PipelineStatus.RUNNING });
      expect(result.status).toBe('RUNNING');
    });

    it('should allow RUNNING -> COMPLETED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.RUNNING });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({ id: 'p-1', status: PipelineStatus.COMPLETED });
      const result = await service.transition('p-1', { status: PipelineStatus.COMPLETED });
      expect(result.status).toBe('COMPLETED');
    });

    it('should allow RUNNING -> FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.RUNNING });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({ id: 'p-1', status: PipelineStatus.FAILED });
      const result = await service.transition('p-1', { status: PipelineStatus.FAILED });
      expect(result.status).toBe('FAILED');
    });

    it('should allow COMPLETED -> IDLE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.COMPLETED });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      const result = await service.transition('p-1', { status: PipelineStatus.IDLE });
      expect(result.status).toBe('IDLE');
    });

    it('should allow FAILED -> IDLE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.FAILED });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      const result = await service.transition('p-1', { status: PipelineStatus.IDLE });
      expect(result.status).toBe('IDLE');
    });

    it('should reject IDLE -> COMPLETED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      await expect(
        service.transition('p-1', { status: PipelineStatus.COMPLETED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject IDLE -> FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      await expect(
        service.transition('p-1', { status: PipelineStatus.FAILED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RUNNING -> IDLE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.RUNNING });
      await expect(
        service.transition('p-1', { status: PipelineStatus.IDLE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED -> RUNNING', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.COMPLETED });
      await expect(
        service.transition('p-1', { status: PipelineStatus.RUNNING }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create state history record on transition', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({ id: 'p-1', status: PipelineStatus.RUNNING });
      await service.transition('p-1', { status: PipelineStatus.RUNNING });
      expect(prisma.pipelineStateHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pipelineId: 'p-1',
          fromStatus: PipelineStatus.IDLE,
          toStatus: PipelineStatus.RUNNING,
        }),
      });
    });

    it('should set lastRunAt when transitioning to RUNNING', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({});
      await service.transition('p-1', { status: PipelineStatus.RUNNING });
      const updateData = prisma.pipeline.update.mock.calls[0][0].data;
      expect(updateData.lastRunAt).toBeInstanceOf(Date);
    });

    it('should store errorMessage when transitioning to FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.RUNNING });
      prisma.pipelineStateHistory.create.mockResolvedValue({});
      prisma.pipeline.update.mockResolvedValue({});
      await service.transition('p-1', {
        status: PipelineStatus.FAILED,
        errorMessage: 'Connection timeout',
      });
      const updateData = prisma.pipeline.update.mock.calls[0][0].data;
      expect(updateData.errorMessage).toBe('Connection timeout');
    });

    it('should include error message in BadRequestException', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      await expect(
        service.transition('p-1', { status: PipelineStatus.COMPLETED }),
      ).rejects.toThrow(/Invalid transition from IDLE to COMPLETED/);
    });
  });

  describe('getValidTransitions', () => {
    it('should return RUNNING for IDLE state', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.IDLE });
      const result = await service.getValidTransitions('p-1');
      expect(result).toEqual([PipelineStatus.RUNNING]);
    });

    it('should return COMPLETED and FAILED for RUNNING state', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1', status: PipelineStatus.RUNNING });
      const result = await service.getValidTransitions('p-1');
      expect(result).toEqual([PipelineStatus.COMPLETED, PipelineStatus.FAILED]);
    });
  });

  describe('getStateHistory', () => {
    it('should return state history ordered by createdAt', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'p-1' });
      prisma.pipelineStateHistory.findMany.mockResolvedValue([
        { fromStatus: 'IDLE', toStatus: 'RUNNING' },
      ]);
      const result = await service.getStateHistory('p-1');
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException for unknown pipeline', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);
      await expect(service.getStateHistory('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
