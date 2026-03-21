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
  const otherTenantId = 'tenant-2';

  const mockPipeline = {
    id: 'pl-1',
    tenantId,
    name: 'ETL Pipeline',
    description: 'Data processing',
    status: 'DRAFT',
    config: { steps: [] },
    dataSourceId: 'ds-1',
    createdAt: new Date(),
    updatedAt: new Date(),
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
    const createDto = {
      name: 'ETL Pipeline',
      config: { steps: [] },
      dataSourceId: 'ds-1',
    };

    it('should create a pipeline with DRAFT status', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.pipeline.create.mockResolvedValue(mockPipeline);

      const result = await service.create(tenantId, createDto);

      expect(result.id).toBe('pl-1');
      expect(result.status).toBe('DRAFT');
    });

    it('should verify data source belongs to tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId },
      });
    });

    it('should include tenantId in created pipeline', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.pipeline.create.mockResolvedValue(mockPipeline);

      await service.create(tenantId, createDto);

      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, status: 'DRAFT' }),
      });
    });

    it('should create pipeline with description', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.pipeline.create.mockResolvedValue(mockPipeline);

      await service.create(tenantId, { ...createDto, description: 'Transform data' });

      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ description: 'Transform data' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all pipelines for tenant', async () => {
      prisma.pipeline.findMany.mockResolvedValue([
        { ...mockPipeline, id: 'pl-1' },
        { ...mockPipeline, id: 'pl-2' },
      ]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(2);
    });

    it('should filter by tenantId', async () => {
      prisma.pipeline.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.pipeline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId } }),
      );
    });

    it('should include data source info', async () => {
      prisma.pipeline.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.pipeline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ dataSource: expect.any(Object) }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a pipeline with data source', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({
        ...mockPipeline,
        dataSource: { id: 'ds-1', name: 'Test DB' },
      });

      const result = await service.findOne(tenantId, 'pl-1');

      expect(result.id).toBe('pl-1');
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'pl-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should isolate by tenantId', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne(otherTenantId, 'pl-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update pipeline fields', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(mockPipeline);
      prisma.pipeline.update.mockResolvedValue({
        ...mockPipeline,
        name: 'Updated Pipeline',
      });

      const result = await service.update(tenantId, 'pl-1', {
        name: 'Updated Pipeline',
      });

      expect(result.name).toBe('Updated Pipeline');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'pl-999', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(mockPipeline);
      prisma.pipeline.update.mockResolvedValue(mockPipeline);

      await service.update(tenantId, 'pl-1', { name: 'New Name' });

      expect(prisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: 'pl-1' },
        data: { name: 'New Name' },
      });
    });
  });

  describe('transition', () => {
    it('should transition DRAFT -> ACTIVE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'ACTIVE',
      });

      expect(result.status).toBe('ACTIVE');
    });

    it('should transition ACTIVE -> PAUSED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'PAUSED',
      });

      expect(result.status).toBe('PAUSED');
    });

    it('should transition ACTIVE -> FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'FAILED',
      });

      expect(result.status).toBe('FAILED');
    });

    it('should transition ACTIVE -> COMPLETED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'COMPLETED',
      });

      expect(result.status).toBe('COMPLETED');
    });

    it('should transition PAUSED -> ACTIVE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'ACTIVE',
      });

      expect(result.status).toBe('ACTIVE');
    });

    it('should transition PAUSED -> FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'PAUSED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'FAILED',
      });

      expect(result.status).toBe('FAILED');
    });

    it('should transition FAILED -> DRAFT', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'DRAFT',
      });

      expect(result.status).toBe('DRAFT');
    });

    it('should transition COMPLETED -> DRAFT', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      const result = await service.transition(tenantId, 'pl-1', {
        targetStatus: 'DRAFT',
      });

      expect(result.status).toBe('DRAFT');
    });

    it('should reject invalid transition DRAFT -> COMPLETED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'COMPLETED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition DRAFT -> PAUSED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'PAUSED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition DRAFT -> FAILED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'FAILED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition COMPLETED -> ACTIVE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'ACTIVE' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition COMPLETED -> PAUSED', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'COMPLETED' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'PAUSED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition FAILED -> ACTIVE', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'FAILED' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'ACTIVE' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if pipeline not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(
        service.transition(tenantId, 'pl-999', { targetStatus: 'ACTIVE' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should include allowed transitions in error message', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });

      await expect(
        service.transition(tenantId, 'pl-1', { targetStatus: 'COMPLETED' }),
      ).rejects.toThrow(/Allowed transitions from DRAFT/);
    });

    it('should update status in database', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ ...mockPipeline, status: 'DRAFT' });
      prisma.pipeline.update.mockResolvedValue({ ...mockPipeline, status: 'ACTIVE' });

      await service.transition(tenantId, 'pl-1', { targetStatus: 'ACTIVE' });

      expect(prisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: 'pl-1' },
        data: { status: 'ACTIVE' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a pipeline', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(mockPipeline);
      prisma.pipeline.delete.mockResolvedValue(mockPipeline);

      await service.remove(tenantId, 'pl-1');

      expect(prisma.pipeline.delete).toHaveBeenCalledWith({ where: { id: 'pl-1' } });
    });

    it('should throw NotFoundException if pipeline not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'pl-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should prevent deleting another tenants pipeline', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.remove(otherTenantId, 'pl-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
