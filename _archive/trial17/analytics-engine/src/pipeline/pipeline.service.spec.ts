import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { PipelineStatus } from '@prisma/client';

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
        update: vi.fn().mockImplementation(({ data }) => ({
          ...mockPipeline,
          ...data,
        })),
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
    expect(result.status).toBe(PipelineStatus.IDLE);
  });

  it('should find a pipeline by id', async () => {
    const result = await service.findOne('pipe-1');
    expect(result).toEqual(mockPipeline);
  });

  it('should throw NotFoundException if pipeline not found', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findOne('pipe-999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find pipeline by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result).toEqual(mockPipeline);
  });

  it('should transition IDLE -> RUNNING', async () => {
    const result = await service.transition('pipe-1', {
      status: PipelineStatus.RUNNING,
    });
    expect(result.status).toBe(PipelineStatus.RUNNING);
  });

  it('should transition RUNNING -> COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.RUNNING,
    });
    const result = await service.transition('pipe-1', {
      status: PipelineStatus.COMPLETED,
    });
    expect(result.status).toBe(PipelineStatus.COMPLETED);
  });

  it('should transition RUNNING -> FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.RUNNING,
    });
    const result = await service.transition('pipe-1', {
      status: PipelineStatus.FAILED,
      errorMessage: 'Connection timeout',
    });
    expect(result.status).toBe(PipelineStatus.FAILED);
  });

  it('should transition COMPLETED -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.COMPLETED,
    });
    const result = await service.transition('pipe-1', {
      status: PipelineStatus.IDLE,
    });
    expect(result.status).toBe(PipelineStatus.IDLE);
  });

  it('should transition FAILED -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.FAILED,
    });
    const result = await service.transition('pipe-1', {
      status: PipelineStatus.IDLE,
    });
    expect(result.status).toBe(PipelineStatus.IDLE);
  });

  it('should reject IDLE -> COMPLETED', async () => {
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.COMPLETED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject IDLE -> FAILED', async () => {
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.FAILED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject RUNNING -> IDLE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.RUNNING,
    });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.IDLE }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject COMPLETED -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.COMPLETED,
    });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.RUNNING }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject FAILED -> RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.FAILED,
    });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.RUNNING }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject COMPLETED -> FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.COMPLETED,
    });
    await expect(
      service.transition('pipe-1', { status: PipelineStatus.FAILED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should set lastRunAt when transitioning to RUNNING', async () => {
    await service.transition('pipe-1', { status: PipelineStatus.RUNNING });
    const call = prisma.pipeline.update.mock.calls[0][0];
    expect(call.data.lastRunAt).toBeInstanceOf(Date);
  });

  it('should clear errorMessage when transitioning to COMPLETED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.RUNNING,
    });
    await service.transition('pipe-1', { status: PipelineStatus.COMPLETED });
    const call = prisma.pipeline.update.mock.calls[0][0];
    expect(call.data.errorMessage).toBeNull();
  });

  it('should set errorMessage when transitioning to FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.RUNNING,
    });
    await service.transition('pipe-1', {
      status: PipelineStatus.FAILED,
      errorMessage: 'timeout',
    });
    const call = prisma.pipeline.update.mock.calls[0][0];
    expect(call.data.errorMessage).toBe('timeout');
  });

  it('should return valid transitions for IDLE', async () => {
    const result = await service.getValidTransitions('pipe-1');
    expect(result).toEqual([PipelineStatus.RUNNING]);
  });

  it('should return valid transitions for RUNNING', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      ...mockPipeline,
      status: PipelineStatus.RUNNING,
    });
    const result = await service.getValidTransitions('pipe-1');
    expect(result).toEqual([PipelineStatus.COMPLETED, PipelineStatus.FAILED]);
  });
});
