import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma.service';

describe('PipelineService', () => {
  let service: PipelineService;

  const mockPrisma = {
    pipeline: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByTenant', () => {
    it('should return pipelines for a tenant ordered by createdAt desc', async () => {
      const pipelines = [
        { id: 'p1', name: 'Pipeline 1', status: 'ACTIVE' },
        { id: 'p2', name: 'Pipeline 2', status: 'DRAFT' },
      ];
      mockPrisma.pipeline.findMany.mockResolvedValue(pipelines);

      const result = await service.findAllByTenant('tenant-1');

      expect(mockPrisma.pipeline.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(pipelines);
    });
  });

  describe('transitionStatus', () => {
    it('should allow DRAFT → ACTIVE transition', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'p1',
        status: 'DRAFT',
      });
      mockPrisma.pipeline.update.mockResolvedValue({
        id: 'p1',
        status: 'ACTIVE',
      });

      const result = await service.transitionStatus('p1', 'ACTIVE');

      expect(result.status).toBe('ACTIVE');
    });

    it('should reject invalid transition DRAFT → ARCHIVED', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'p1',
        status: 'DRAFT',
      });

      await expect(
        service.transitionStatus('p1', 'ARCHIVED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when pipeline not found', async () => {
      mockPrisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(
        service.transitionStatus('nonexistent', 'ACTIVE'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('countByTenantRaw', () => {
    it('should return count from raw query', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ count: BigInt(5) }]);

      const result = await service.countByTenantRaw('tenant-1');

      expect(result).toBe(5);
    });
  });

  describe('activatePipeline', () => {
    it('should execute raw update and return pipeline', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.pipeline.findFirst.mockResolvedValue({
        id: 'p1',
        status: 'ACTIVE',
      });

      const result = await service.activatePipeline('p1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
      expect(result?.status).toBe('ACTIVE');
    });
  });
});
