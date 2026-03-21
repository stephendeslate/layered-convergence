import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';

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

  const mockPipeline = {
    id: 'pipe-1',
    dataSourceId: 'ds-1',
    status: 'IDLE' as const,
    lastRunAt: null,
    errorMessage: null,
  };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        create: vi.fn().mockResolvedValue(mockPipeline),
        findFirst: vi.fn().mockResolvedValue(mockPipeline),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...mockPipeline,
          ...data,
        })),
      },
      pipelineStateHistory: {
        create: vi.fn().mockResolvedValue({ id: 'hist-1' }),
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pipeline in IDLE state', async () => {
    const result = await service.create({ dataSourceId: 'ds-1' });
    expect(result.status).toBe('IDLE');
  });

  it('should find a pipeline by id', async () => {
    const result = await service.findOne('pipe-1');
    expect(result.id).toBe('pipe-1');
  });

  it('should throw NotFoundException when pipeline not found', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should find pipeline by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result.dataSourceId).toBe('ds-1');
  });

  it('should throw NotFoundException when pipeline not found by dataSourceId', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findByDataSourceId('missing')).rejects.toThrow(NotFoundException);
  });

  it('should allow IDLE -> RUNNING', async () => {
    const result = await service.transition('pipe-1', { status: 'RUNNING' as const });
    expect(result.status).toBe('RUNNING');
  });

  it('should reject IDLE -> COMPLETED', async () => {
    await expect(
      service.transition('pipe-1', { status: 'COMPLETED' as const }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject IDLE -> FAILED', async () => {
    await expect(
      service.transition('pipe-1', { status: 'FAILED' as const }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow RUNNING -> COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'RUNNING' });
    const result = await service.transition('pipe-1', { status: 'COMPLETED' as const });
    expect(result.status).toBe('COMPLETED');
  });

  it('should allow RUNNING -> FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'RUNNING' });
    const result = await service.transition('pipe-1', {
      status: 'FAILED' as const,
      errorMessage: 'timeout',
    });
    expect(result.status).toBe('FAILED');
  });

  it('should reject RUNNING -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'RUNNING' });
    await expect(
      service.transition('pipe-1', { status: 'IDLE' as const }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow COMPLETED -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });
    const result = await service.transition('pipe-1', { status: 'IDLE' as const });
    expect(result.status).toBe('IDLE');
  });

  it('should allow FAILED -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });
    const result = await service.transition('pipe-1', { status: 'IDLE' as const });
    expect(result.status).toBe('IDLE');
  });

  it('should reject COMPLETED -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });
    await expect(
      service.transition('pipe-1', { status: 'RUNNING' as const }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject FAILED -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });
    await expect(
      service.transition('pipe-1', { status: 'RUNNING' as const }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should set lastRunAt when transitioning to RUNNING', async () => {
    await service.transition('pipe-1', { status: 'RUNNING' as const });
    expect(prisma.pipeline.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastRunAt: expect.any(Date) }),
      }),
    );
  });

  it('should clear errorMessage when transitioning to RUNNING', async () => {
    await service.transition('pipe-1', { status: 'RUNNING' as const });
    expect(prisma.pipeline.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ errorMessage: null }),
      }),
    );
  });

  it('should save error message on FAILED transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'RUNNING' });
    await service.transition('pipe-1', {
      status: 'FAILED' as const,
      errorMessage: 'connection refused',
    });
    expect(prisma.pipeline.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ errorMessage: 'connection refused' }),
      }),
    );
  });

  it('should include proper error message in BadRequestException', async () => {
    await expect(
      service.transition('pipe-1', { status: 'COMPLETED' as const }),
    ).rejects.toThrow('Invalid transition from IDLE to COMPLETED');
  });

  it('should return valid transitions from IDLE', async () => {
    const transitions = await service.getValidTransitions('pipe-1');
    expect(transitions).toEqual(['RUNNING']);
  });

  it('should return valid transitions from RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'RUNNING' });
    const transitions = await service.getValidTransitions('pipe-1');
    expect(transitions).toEqual(['COMPLETED', 'FAILED']);
  });

  it('should return valid transitions from COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });
    const transitions = await service.getValidTransitions('pipe-1');
    expect(transitions).toEqual(['IDLE']);
  });

  it('should return valid transitions from FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });
    const transitions = await service.getValidTransitions('pipe-1');
    expect(transitions).toEqual(['IDLE']);
  });

  it('should record state history on transition', async () => {
    await service.transition('pipe-1', { status: 'RUNNING' as const });
    expect(prisma.pipelineStateHistory.create).toHaveBeenCalledWith({
      data: {
        pipelineId: 'pipe-1',
        fromStatus: 'IDLE',
        toStatus: 'RUNNING',
      },
    });
  });

  it('should get state history for a pipeline', async () => {
    await service.getStateHistory('pipe-1');
    expect(prisma.pipelineStateHistory.findMany).toHaveBeenCalledWith({
      where: { pipelineId: 'pipe-1' },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should throw NotFoundException when getting history for missing pipeline', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.getStateHistory('missing')).rejects.toThrow(NotFoundException);
  });
});
