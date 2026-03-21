import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PipelineRunsService } from './pipeline-runs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PipelineRunsService', () => {
  let service: PipelineRunsService;
  let prisma: any;

  const mockRun = {
    id: 'run-1',
    pipelineId: 'pipe-1',
    status: 'running',
    rowsIngested: 0,
    errorLog: null,
    startedAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      pipelineRun: {
        findMany: vi.fn().mockResolvedValue([mockRun]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockRun),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(mockRun),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        PipelineRunsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PipelineRunsService>(PipelineRunsService);
  });

  describe('findAll', () => {
    it('should return runs for a pipeline', async () => {
      const result = await service.findAll('pipe-1');
      expect(result).toEqual([mockRun]);
    });

    it('should order by startedAt desc', async () => {
      await service.findAll('pipe-1');
      expect(prisma.pipelineRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { startedAt: 'desc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a run by id', async () => {
      prisma.pipelineRun.findUnique.mockResolvedValue(mockRun);
      const result = await service.findOne('run-1');
      expect(result).toEqual(mockRun);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.pipelineRun.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a run with running status', async () => {
      await service.create({ pipelineId: 'pipe-1' });
      expect(prisma.pipelineRun.create).toHaveBeenCalledWith({
        data: { pipelineId: 'pipe-1', status: 'running' },
      });
    });
  });

  describe('complete', () => {
    it('should mark run as completed with row count', async () => {
      prisma.pipelineRun.update.mockResolvedValue({ ...mockRun, status: 'completed', rowsIngested: 42 });
      const result = await service.complete('run-1', 42);
      expect(result.status).toBe('completed');
      expect(result.rowsIngested).toBe(42);
    });
  });

  describe('fail', () => {
    it('should mark run as failed with error log', async () => {
      prisma.pipelineRun.update.mockResolvedValue({ ...mockRun, status: 'failed', errorLog: 'timeout' });
      const result = await service.fail('run-1', 'timeout');
      expect(result.status).toBe('failed');
    });
  });
});
