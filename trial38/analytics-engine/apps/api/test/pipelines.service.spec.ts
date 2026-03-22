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
    it('should create a pipeline with tenant assignment', async () => {
      prisma.pipeline.create.mockResolvedValue({
        id: 'pipe-1',
        name: 'Daily ETL',
        tenantId: 'tenant-1',
        createdBy: 'user-1',
      });

      await service.create('tenant-1', 'user-1', {
        name: 'Daily ETL',
        description: 'Extract and load data',
      });

      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Daily ETL',
          tenantId: 'tenant-1',
          createdBy: 'user-1',
        }),
      });
    });

    it('should sanitize the pipeline name', async () => {
      prisma.pipeline.create.mockResolvedValue({
        id: 'pipe-2',
        name: 'Clean Name',
        tenantId: 'tenant-1',
      });

      await service.create('tenant-1', 'user-1', {
        name: '<b>Clean Name</b>',
      });

      expect(prisma.pipeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: expect.not.stringContaining('<b>'),
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated pipelines for a tenant', async () => {
      const mockPipelines = [
        { id: 'pipe-1', name: 'Pipeline A' },
        { id: 'pipe-2', name: 'Pipeline B' },
      ];
      prisma.pipeline.findMany.mockResolvedValue(mockPipelines);
      prisma.pipeline.count.mockResolvedValue(2);

      const result = await service.findAll('tenant-1');

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      prisma.pipeline.findMany.mockResolvedValue([]);
      prisma.pipeline.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 1, 999);

      expect(prisma.pipeline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a pipeline by id and tenantId', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        tenantId: 'tenant-1',
      });

      const result = await service.findOne('pipe-1', 'tenant-1');

      expect(result).toBeDefined();
      expect(prisma.pipeline.findFirst).toHaveBeenCalledWith({
        where: { id: 'pipe-1', tenantId: 'tenant-1' },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update pipeline fields', async () => {
      prisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        name: 'Updated Pipeline',
      });

      await service.update('pipe-1', { name: 'Updated Pipeline' });

      expect(prisma.pipeline.update).toHaveBeenCalledWith({
        where: { id: 'pipe-1' },
        data: expect.objectContaining({ name: 'Updated Pipeline' }),
      });
    });
  });

  describe('remove', () => {
    it('should delete a pipeline by id', async () => {
      prisma.pipeline.delete.mockResolvedValue({ id: 'pipe-1' });

      await service.remove('pipe-1');

      expect(prisma.pipeline.delete).toHaveBeenCalledWith({
        where: { id: 'pipe-1' },
      });
    });
  });
});
