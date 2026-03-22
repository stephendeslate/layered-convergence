// TRACED: AE-TEST-04
import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesService } from '../src/pipelines/pipelines.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PipelinesService', () => {
  let service: PipelinesService;
  let prisma: {
    pipeline: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      pipeline: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelinesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
  });

  describe('create', () => {
    it('should create a pipeline with correct tenant assignment', async () => {
      prisma.pipeline.create.mockResolvedValue({
        id: 'pipe-1',
        name: 'Daily ETL',
        tenantId: 'tenant-1',
        createdBy: 'user-1',
      });

      await service.create('tenant-1', 'user-1', {
        name: 'Daily ETL',
        description: 'Process daily data',
        schedule: '0 2 * * *',
      });

      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Daily ETL',
          tenantId: 'tenant-1',
          createdBy: 'user-1',
          schedule: '0 2 * * *',
        }),
      });
    });

    it('should sanitize pipeline name input', async () => {
      prisma.pipeline.create.mockResolvedValue({
        id: 'pipe-1',
        name: 'Clean Pipeline',
      });

      await service.create('tenant-1', 'user-1', {
        name: '<script>Clean Pipeline</script>',
      });

      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Clean Pipeline',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return pipelines filtered by tenant', async () => {
      const mockPipelines = [
        { id: 'pipe-1', name: 'ETL', tenantId: 'tenant-1', runs: [] },
      ];
      prisma.pipeline.findMany.mockResolvedValue(mockPipelines);
      prisma.pipeline.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.items).toEqual(mockPipelines);
      expect(result.total).toBe(1);
      expect(prisma.pipeline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should filter by both id and tenantId for isolation', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        tenantId: 'tenant-1',
      });

      await service.findOne('pipe-1', 'tenant-1');

      expect(prisma.pipeline.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pipe-1', tenantId: 'tenant-1' },
        }),
      );
    });

    it('should return null for pipelines from other tenants', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      const result = await service.findOne('pipe-1', 'wrong-tenant');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update only provided fields', async () => {
      prisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        name: 'Updated Name',
      });

      await service.update('pipe-1', { name: 'Updated Name' });

      expect(prisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: 'pipe-1' },
        data: expect.objectContaining({ name: 'Updated Name' }),
      });
    });
  });

  describe('remove', () => {
    it('should delete the pipeline by id', async () => {
      prisma.pipeline.delete.mockResolvedValue({ id: 'pipe-1' });

      await service.remove('pipe-1');

      expect(prisma.pipeline.delete).toHaveBeenCalledWith({
        where: { id: 'pipe-1' },
      });
    });
  });
});
