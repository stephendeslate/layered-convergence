import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PipelinesService', () => {
  let service: PipelinesService;
  let prisma: any;

  const mockPipeline = {
    id: 'pipe-1',
    name: 'Test Pipeline',
    description: null,
    status: 'DRAFT',
    config: {},
    organizationId: 'org-1',
    statusHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        findMany: vi.fn().mockResolvedValue([mockPipeline]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockPipeline),
        update: vi.fn().mockResolvedValue(mockPipeline),
        delete: vi.fn().mockResolvedValue(mockPipeline),
      },
      pipelineStatusHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((fn: any) => fn(prisma)),
    };

    const module = await Test.createTestingModule({
      providers: [
        PipelinesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
  });

  describe('findAll', () => {
    it('should return pipelines for organization', async () => {
      const result = await service.findAll('org-1');
      expect(result).toEqual([mockPipeline]);
    });
  });

  describe('findOne', () => {
    it('should return pipeline by id', async () => {
      prisma.pipeline.findUnique.mockResolvedValue(mockPipeline);
      const result = await service.findOne('pipe-1');
      expect(result).toEqual(mockPipeline);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.pipeline.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a pipeline', async () => {
      const result = await service.create({ name: 'New' }, 'org-1');
      expect(result).toEqual(mockPipeline);
      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New',
          organizationId: 'org-1',
        }),
      });
    });
  });

  describe('transition', () => {
    it('should transition DRAFT to ACTIVE', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      const result = await service.transition('pipe-1', 'ACTIVE' as any);
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw BadRequestException for DRAFT to PAUSED', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition('pipe-1', 'PAUSED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for DRAFT to ARCHIVED', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition('pipe-1', 'ARCHIVED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow ACTIVE to PAUSED', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });

      const result = await service.transition('pipe-1', 'PAUSED' as any);
      expect(result.status).toBe('PAUSED');
    });

    it('should allow ACTIVE to ARCHIVED', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ARCHIVED' });

      const result = await service.transition('pipe-1', 'ARCHIVED' as any);
      expect(result.status).toBe('ARCHIVED');
    });

    it('should allow PAUSED to ACTIVE', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      const result = await service.transition('pipe-1', 'ACTIVE' as any);
      expect(result.status).toBe('ACTIVE');
    });

    it('should allow PAUSED to ARCHIVED', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ARCHIVED' });

      const result = await service.transition('pipe-1', 'ARCHIVED' as any);
      expect(result.status).toBe('ARCHIVED');
    });

    it('should throw BadRequestException from ARCHIVED to any state', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'ARCHIVED' });

      await expect(
        service.transition('pipe-1', 'ACTIVE' as any),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.transition('pipe-1', 'DRAFT' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should record status history on transition', async () => {
      prisma.pipeline.findUnique.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      await service.transition('pipe-1', 'ACTIVE' as any);

      expect(prisma.pipelineStatusHistory.create).toHaveBeenCalledWith({
        data: {
          pipelineId: 'pipe-1',
          fromStatus: 'DRAFT',
          toStatus: 'ACTIVE',
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a pipeline', async () => {
      await service.remove('pipe-1');
      expect(prisma.pipeline.delete).toHaveBeenCalledWith({ where: { id: 'pipe-1' } });
    });
  });
});
