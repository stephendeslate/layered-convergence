import { describe, it, expect, beforeEach } from 'vitest';
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pipeline in IDLE state', async () => {
    prisma.pipeline.create.mockResolvedValue({ id: 'p1', status: 'IDLE', dataSourceId: 'ds1' });
    const result = await service.create({ dataSourceId: 'ds1' });
    expect(result.status).toBe('IDLE');
    expect(prisma.pipeline.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds1', status: 'IDLE' },
    });
  });

  it('should find a pipeline by id', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'IDLE' });
    const result = await service.findOne('p1');
    expect(result.id).toBe('p1');
  });

  it('should throw NotFoundException for non-existent pipeline', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('should allow IDLE -> RUNNING transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'IDLE' });
    prisma.pipelineStateHistory.create.mockResolvedValue({});
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'RUNNING' });

    const result = await service.transition('p1', { status: 'RUNNING' as any });
    expect(result.status).toBe('RUNNING');
  });

  it('should reject IDLE -> COMPLETED transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'IDLE' });
    await expect(
      service.transition('p1', { status: 'COMPLETED' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject IDLE -> FAILED transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'IDLE' });
    await expect(
      service.transition('p1', { status: 'FAILED' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow RUNNING -> COMPLETED transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'RUNNING' });
    prisma.pipelineStateHistory.create.mockResolvedValue({});
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'COMPLETED' });

    const result = await service.transition('p1', { status: 'COMPLETED' as any });
    expect(result.status).toBe('COMPLETED');
  });

  it('should allow RUNNING -> FAILED with error message', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'RUNNING' });
    prisma.pipelineStateHistory.create.mockResolvedValue({});
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'FAILED', errorMessage: 'err' });

    const result = await service.transition('p1', {
      status: 'FAILED' as any,
      errorMessage: 'err',
    });
    expect(result.status).toBe('FAILED');
  });

  it('should allow COMPLETED -> IDLE transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'COMPLETED' });
    prisma.pipelineStateHistory.create.mockResolvedValue({});
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'IDLE' });

    const result = await service.transition('p1', { status: 'IDLE' as any });
    expect(result.status).toBe('IDLE');
  });

  it('should allow FAILED -> IDLE transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'FAILED' });
    prisma.pipelineStateHistory.create.mockResolvedValue({});
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'IDLE' });

    const result = await service.transition('p1', { status: 'IDLE' as any });
    expect(result.status).toBe('IDLE');
  });

  it('should reject COMPLETED -> RUNNING transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'COMPLETED' });
    await expect(
      service.transition('p1', { status: 'RUNNING' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create state history entry on transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'IDLE' });
    prisma.pipelineStateHistory.create.mockResolvedValue({});
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'RUNNING' });

    await service.transition('p1', { status: 'RUNNING' as any });
    expect(prisma.pipelineStateHistory.create).toHaveBeenCalledWith({
      data: {
        pipelineId: 'p1',
        fromStatus: 'IDLE',
        toStatus: 'RUNNING',
        errorMessage: undefined,
      },
    });
  });

  it('should return valid transitions for IDLE state', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'IDLE' });
    const result = await service.getValidTransitions('p1');
    expect(result).toEqual(['RUNNING']);
  });

  it('should return valid transitions for RUNNING state', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'RUNNING' });
    const result = await service.getValidTransitions('p1');
    expect(result).toEqual(['COMPLETED', 'FAILED']);
  });

  it('should get state history', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'IDLE' });
    prisma.pipelineStateHistory.findMany.mockResolvedValue([
      { fromStatus: 'IDLE', toStatus: 'RUNNING' },
    ]);
    const result = await service.getStateHistory('p1');
    expect(result).toHaveLength(1);
  });
});
