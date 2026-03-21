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
      mockPrismaService.pipeline.create.mockResolvedValue({ id: '1', name: 'Test', status: 'DRAFT' });

      const result = await service.create({ name: 'Test', tenantId: 'tenant-1' });

      expect(result).toEqual({ id: '1', name: 'Test', status: 'DRAFT' });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when pipeline not found', async () => {
      mockPrismaService.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow DRAFT -> ACTIVE', async () => {
      mockPrismaService.pipeline.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', tenantId: 'tenant-1' });
      mockPrismaService.pipeline.update.mockResolvedValue({ id: '1', status: 'ACTIVE' });

      const result = await service.transition('1', 'tenant-1', 'ACTIVE' as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED');

      expect(result.status).toBe('ACTIVE');
    });

    it('should reject DRAFT -> ARCHIVED', async () => {
      mockPrismaService.pipeline.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', tenantId: 'tenant-1' });

      await expect(
        service.transition('1', 'tenant-1', 'ARCHIVED' as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ARCHIVED -> any', async () => {
      mockPrismaService.pipeline.findFirst.mockResolvedValue({ id: '1', status: 'ARCHIVED', tenantId: 'tenant-1' });

      await expect(
        service.transition('1', 'tenant-1', 'ACTIVE' as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
