import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  pipeline: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a pipeline with default config', async () => {
      const data = { name: 'Test Pipeline', tenantId: 'tenant-1' };
      const created = { id: 'pipe-1', ...data, status: 'DRAFT', config: {} };

      mockPrismaService.pipeline.create.mockResolvedValue(created);

      const result = await service.create(data);

      expect(mockPrismaService.pipeline.create).toHaveBeenCalledWith({
        data: { name: data.name, tenantId: data.tenantId, config: {} },
      });
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all pipelines for tenant', async () => {
      const pipelines = [{ id: 'pipe-1', name: 'P1', tenantId: 'tenant-1' }];
      mockPrismaService.pipeline.findMany.mockResolvedValue(pipelines);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual(pipelines);
      expect(mockPrismaService.pipeline.findMany).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' } });
    });
  });

  describe('findOne', () => {
    it('should return pipeline when found', async () => {
      const pipeline = { id: 'pipe-1', name: 'P1', tenantId: 'tenant-1', status: 'DRAFT' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);

      const result = await service.findOne('pipe-1', 'tenant-1');
      expect(result).toEqual(pipeline);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition (state machine)', () => {
    it('should allow DRAFT -> ACTIVE', async () => {
      const pipeline = { id: 'pipe-1', status: 'DRAFT', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.update.mockResolvedValue({ ...pipeline, status: 'ACTIVE' });

      const result = await service.transition('pipe-1', 'tenant-1', 'ACTIVE' as const);
      expect(result.status).toBe('ACTIVE');
    });

    it('should allow ACTIVE -> PAUSED', async () => {
      const pipeline = { id: 'pipe-1', status: 'ACTIVE', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.update.mockResolvedValue({ ...pipeline, status: 'PAUSED' });

      const result = await service.transition('pipe-1', 'tenant-1', 'PAUSED' as const);
      expect(result.status).toBe('PAUSED');
    });

    it('should allow ACTIVE -> ARCHIVED', async () => {
      const pipeline = { id: 'pipe-1', status: 'ACTIVE', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.update.mockResolvedValue({ ...pipeline, status: 'ARCHIVED' });

      const result = await service.transition('pipe-1', 'tenant-1', 'ARCHIVED' as const);
      expect(result.status).toBe('ARCHIVED');
    });

    it('should allow PAUSED -> ACTIVE', async () => {
      const pipeline = { id: 'pipe-1', status: 'PAUSED', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.update.mockResolvedValue({ ...pipeline, status: 'ACTIVE' });

      const result = await service.transition('pipe-1', 'tenant-1', 'ACTIVE' as const);
      expect(result.status).toBe('ACTIVE');
    });

    it('should allow PAUSED -> ARCHIVED', async () => {
      const pipeline = { id: 'pipe-1', status: 'PAUSED', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.update.mockResolvedValue({ ...pipeline, status: 'ARCHIVED' });

      const result = await service.transition('pipe-1', 'tenant-1', 'ARCHIVED' as const);
      expect(result.status).toBe('ARCHIVED');
    });

    it('should reject DRAFT -> PAUSED', async () => {
      const pipeline = { id: 'pipe-1', status: 'DRAFT', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);

      await expect(service.transition('pipe-1', 'tenant-1', 'PAUSED' as const)).rejects.toThrow(BadRequestException);
    });

    it('should reject DRAFT -> ARCHIVED', async () => {
      const pipeline = { id: 'pipe-1', status: 'DRAFT', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);

      await expect(service.transition('pipe-1', 'tenant-1', 'ARCHIVED' as const)).rejects.toThrow(BadRequestException);
    });

    it('should reject ARCHIVED -> any', async () => {
      const pipeline = { id: 'pipe-1', status: 'ARCHIVED', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);

      await expect(service.transition('pipe-1', 'tenant-1', 'ACTIVE' as const)).rejects.toThrow(BadRequestException);
      await expect(service.transition('pipe-1', 'tenant-1', 'DRAFT' as const)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update pipeline name', async () => {
      const pipeline = { id: 'pipe-1', name: 'Old', tenantId: 'tenant-1', status: 'DRAFT' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.update.mockResolvedValue({ ...pipeline, name: 'New' });

      const result = await service.update('pipe-1', 'tenant-1', { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete pipeline', async () => {
      const pipeline = { id: 'pipe-1', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.delete.mockResolvedValue(pipeline);

      await service.remove('pipe-1', 'tenant-1');
      expect(mockPrismaService.pipeline.delete).toHaveBeenCalledWith({ where: { id: 'pipe-1' } });
    });
  });
});
