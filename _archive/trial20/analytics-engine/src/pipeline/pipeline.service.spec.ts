import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  };

  const mockPipeline = {
    id: 'pipe-1',
    dataSourceId: 'ds-1',
    status: PipelineStatus.IDLE,
    lastRunAt: null,
    errorMessage: null,
  };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        create: vi.fn().mockResolvedValue(mockPipeline),
        findFirst: vi.fn().mockResolvedValue(mockPipeline),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockPipeline, ...data })),
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

  it('should create a pipeline with IDLE status', async () => {
    const result = await service.create({ dataSourceId: 'ds-1' });
    expect(result).toEqual(mockPipeline);
    expect(prisma.pipeline.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds-1', status: 'IDLE' },
    });
  });

  it('should find one pipeline', async () => {
    const result = await service.findOne('pipe-1');
    expect(result).toEqual(mockPipeline);
  });

  it('should throw NotFoundException when pipeline not found', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should find pipeline by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result).toEqual(mockPipeline);
  });

  it('should throw NotFoundException when pipeline not found by data source id', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findByDataSourceId('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should allow IDLE -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.IDLE });
    const result = await service.transition('pipe-1', { status: PipelineStatus.RUNNING });
    expect(result.status).toBe(PipelineStatus.RUNNING);
  });

  it('should allow RUNNING -> COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.RUNNING });
    const result = await service.transition('pipe-1', { status: PipelineStatus.COMPLETED });
    expect(result.status).toBe(PipelineStatus.COMPLETED);
  });

  it('should allow RUNNING -> FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.RUNNING });
    const result = await service.transition('pipe-1', { status: PipelineStatus.FAILED, errorMessage: 'timeout' });
    expect(result.status).toBe(PipelineStatus.FAILED);
  });

  it('should allow COMPLETED -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.COMPLETED });
    const result = await service.transition('pipe-1', { status: PipelineStatus.IDLE });
    expect(result.status).toBe(PipelineStatus.IDLE);
  });

  it('should allow FAILED -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.FAILED });
    const result = await service.transition('pipe-1', { status: PipelineStatus.IDLE });
    expect(result.status).toBe(PipelineStatus.IDLE);
  });

  it('should reject IDLE -> COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.IDLE });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.COMPLETED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject IDLE -> FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.IDLE });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.FAILED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject RUNNING -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.RUNNING });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.IDLE }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject COMPLETED -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.COMPLETED });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.RUNNING }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject FAILED -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.FAILED });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.RUNNING }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should set lastRunAt when transitioning to RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.IDLE });
    await service.transition('pipe-1', { status: PipelineStatus.RUNNING });
    const callArgs = prisma.pipeline.update.mock.calls[0][0];
    expect(callArgs.data.lastRunAt).toBeInstanceOf(Date);
    expect(callArgs.data.errorMessage).toBeNull();
  });

  it('should store errorMessage when transitioning to FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.RUNNING });
    await service.transition('pipe-1', { status: PipelineStatus.FAILED, errorMessage: 'connection timeout' });
    const callArgs = prisma.pipeline.update.mock.calls[0][0];
    expect(callArgs.data.errorMessage).toBe('connection timeout');
  });

  it('should clear errorMessage when transitioning to COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.RUNNING });
    await service.transition('pipe-1', { status: PipelineStatus.COMPLETED });
    const callArgs = prisma.pipeline.update.mock.calls[0][0];
    expect(callArgs.data.errorMessage).toBeNull();
  });

  it('should get valid transitions for IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.IDLE });
    const result = await service.getValidTransitions('pipe-1');
    expect(result).toEqual([PipelineStatus.RUNNING]);
  });

  it('should get valid transitions for RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.RUNNING });
    const result = await service.getValidTransitions('pipe-1');
    expect(result).toEqual([PipelineStatus.COMPLETED, PipelineStatus.FAILED]);
  });

  it('should get valid transitions for COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.COMPLETED });
    const result = await service.getValidTransitions('pipe-1');
    expect(result).toEqual([PipelineStatus.IDLE]);
  });

  it('should get valid transitions for FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: PipelineStatus.FAILED });
    const result = await service.getValidTransitions('pipe-1');
    expect(result).toEqual([PipelineStatus.IDLE]);
  });
});
