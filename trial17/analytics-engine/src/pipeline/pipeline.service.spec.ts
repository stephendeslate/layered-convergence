import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: {
    pipeline: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    dataSource: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';

  const mockPipeline = {
    id: 'pl-1',
    tenantId,
    name: 'ETL Pipeline',
    description: 'Test pipeline',
    status: 'DRAFT',
    config: { steps: ['extract'] },
    dataSourceId: 'ds-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    dataSource: { id: 'ds-1', name: 'Test DB', type: 'POSTGRESQL' },
  };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      dataSource: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  describe('create', () => {
    it('should create a pipeline with DRAFT status', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.pipeline.create.mockResolvedValue(mockPipeline);

      const result = await service.create(tenantId, {
        name: 'ETL Pipeline',
        config: { steps: ['extract'] },
        dataSourceId: 'ds-1',
      });

      expect(result.status).toBe('DRAFT');
      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'DRAFT', tenantId }),
      });
    });

    it('should throw NotFoundException for non-existent data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          name: 'Pipeline',
          config: {},
          dataSourceId: 'ds-999',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify data source belongs to tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          name: 'Pipeline',
          config: {},
          dataSourceId: 'ds-other',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-other', tenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all pipelines for tenant', async () => {
      prisma.pipeline.findMany.mockResolvedValue([mockPipeline]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(1);
      expect(prisma.pipeline.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { dataSource: { select: { id: true, name: true, type: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a pipeline', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(mockPipeline);

      const result = await service.findOne(tenantId, 'pl-1');

      expect(result.id).toBe('pl-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'pl-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transition', () => {
    it('should allow DRAFT -> ACTIVE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      const result = await service.transition(tenantId, 'pl-1', { targetStatus: 'ACTIVE' });

      expect(result.status).toBe('ACTIVE');
    });

    it('should allow ACTIVE -> PAUSED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });

      const result = await service.transition(tenantId, 'pl-1', { targetStatus: 'PAUSED' });

      expect(result.status).toBe('PAUSED');
    });

    it('should allow ACTIVE -> COMPLETED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });

      const result = await service.transition(tenantId, 'pl-1', { targetStatus: 'COMPLETED' });

      expect(result.status).toBe('COMPLETED');
    });

    it('should allow ACTIVE -> FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });

      const result = await service.transition(tenantId, 'pl-1', { targetStatus: 'FAILED' });

      expect(result.status).toBe('FAILED');
    });

    it('should allow PAUSED -> ACTIVE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      const result = await service.transition(tenantId, 'pl-1', { targetStatus: 'ACTIVE' });

      expect(result.status).toBe('ACTIVE');
    });

    it('should allow FAILED -> DRAFT', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      const result = await service.transition(tenantId, 'pl-1', { targetStatus: 'DRAFT' });

      expect(result.status).toBe('DRAFT');
    });

    it('should allow COMPLETED -> DRAFT', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      const result = await service.transition(tenantId, 'pl-1', { targetStatus: 'DRAFT' });

      expect(result.status).toBe('DRAFT');
    });

    it('should reject DRAFT -> PAUSED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'PAUSED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DRAFT -> COMPLETED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'COMPLETED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DRAFT -> FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'FAILED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include allowed transitions in error message', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'COMPLETED' }),
      ).rejects.toThrow(/ACTIVE/);
    });
  });

  describe('remove', () => {
    it('should delete a pipeline', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(mockPipeline);
      prisma.pipeline.delete.mockResolvedValue(mockPipeline);

      await service.remove(tenantId, 'pl-1');

      expect(prisma.pipeline.delete).toHaveBeenCalledWith({ where: { id: 'pl-1' } });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'pl-999')).rejects.toThrow(NotFoundException);
    });
  });
});
