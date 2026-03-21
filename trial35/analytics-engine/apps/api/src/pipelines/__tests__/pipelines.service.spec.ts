// TRACED: AE-TEST-003 — Pipelines service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelinesService } from '../pipelines.service';
import { PrismaService } from '../../prisma.service';

describe('PipelinesService', () => {
  let service: PipelinesService;
  let prisma: {
    pipeline: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
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
    it('should create a pipeline with generated ID', async () => {
      prisma.pipeline.create.mockResolvedValue({ id: 'pipe_abc12345', name: 'ETL' });

      const result = await service.create('tenant-1', 'user-1', { name: 'ETL', source: 'postgres' });

      expect(result.id).toBeDefined();
      const createArg = prisma.pipeline.create.mock.calls[0][0];
      expect(createArg.data.id).toMatch(/^pipe_/);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid status transitions', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT' });
      prisma.pipeline.update.mockResolvedValue({ id: '1', status: 'ACTIVE' });

      const result = await service.updateStatus('tenant-1', '1', 'ACTIVE');

      expect(result.status).toBe('ACTIVE');
    });

    it('should reject invalid status transitions', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT' });

      await expect(service.updateStatus('tenant-1', '1', 'COMPLETED')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.updateStatus('tenant-1', 'x', 'ACTIVE')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.pipeline.findMany.mockResolvedValue([{ id: '1', name: 'ETL' }]);
      prisma.pipeline.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
