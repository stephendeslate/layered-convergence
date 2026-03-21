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
    it('should create a pipeline with DRAFT status by default', async () => {
      const data = { name: 'Test Pipeline', tenantId: 'tenant-1' };
      const created = { id: 'p-1', ...data, status: 'DRAFT', config: {} };

      mockPrismaService.pipeline.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result.name).toBe('Test Pipeline');
      expect(mockPrismaService.pipeline.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all pipelines for tenant', async () => {
      mockPrismaService.pipeline.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return pipeline by id and tenantId', async () => {
      const pipeline = { id: 'p-1', name: 'Test', status: 'DRAFT', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);

      const result = await service.findOne('p-1', 'tenant-1');
      expect(result.id).toBe('p-1');
    });

    it('should throw NotFoundException if pipeline not found', async () => {
      mockPrismaService.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow DRAFT -> ACTIVE transition', async () => {
      const pipeline = { id: 'p-1', status: 'DRAFT', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.update.mockResolvedValue({ ...pipeline, status: 'ACTIVE' });

      const result = await service.transition('p-1', 'tenant-1', 'ACTIVE' as never);
      expect(result.status).toBe('ACTIVE');
    });

    it('should reject invalid transition DRAFT -> ARCHIVED', async () => {
      const pipeline = { id: 'p-1', status: 'DRAFT', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);

      await expect(service.transition('p-1', 'tenant-1', 'ARCHIVED' as never)).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from ARCHIVED (terminal state)', async () => {
      const pipeline = { id: 'p-1', status: 'ARCHIVED', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);

      await expect(service.transition('p-1', 'tenant-1', 'ACTIVE' as never)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a pipeline', async () => {
      const pipeline = { id: 'p-1', name: 'Test', tenantId: 'tenant-1' };
      mockPrismaService.pipeline.findFirst.mockResolvedValue(pipeline);
      mockPrismaService.pipeline.delete.mockResolvedValue(pipeline);

      const result = await service.remove('p-1', 'tenant-1');
      expect(result.id).toBe('p-1');
    });
  });
});
