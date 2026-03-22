// TRACED:AE-TEST-03 — Pipeline service unit tests

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
    it('should create a pipeline with select fields', async () => {
      const dto = {
        name: 'ETL Pipeline',
        description: 'Daily data extraction',
        tenantId: 'tenant-1',
      };
      const created = { id: 'pipe-1', ...dto, status: 'IDLE', createdAt: new Date() };
      prisma.pipeline.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result.id).toBe('pipe-1');
      expect(prisma.pipeline.create).toHaveBeenCalledWith(
        expect.objectContaining({ select: expect.any(Object) }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated pipelines', async () => {
      prisma.pipeline.findMany.mockResolvedValue([
        { id: 'pipe-1', name: 'ETL', status: 'IDLE' },
      ]);
      prisma.pipeline.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by status when provided', async () => {
      prisma.pipeline.findMany.mockResolvedValue([]);
      prisma.pipeline.count.mockResolvedValue(0);

      await service.findAll({ page: 1, pageSize: 10, status: 'RUNNING' });

      expect(prisma.pipeline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'RUNNING' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return pipeline with runs and tenant', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({
        id: 'pipe-1',
        name: 'ETL',
        runs: [{ id: 'run-1', status: 'SUCCESS' }],
        tenant: { id: 'tenant-1', name: 'Acme' },
      });

      const result = await service.findOne('pipe-1');

      expect(result.runs).toHaveLength(1);
      expect(prisma.pipeline.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ include: expect.any(Object) }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.pipeline.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update pipeline fields', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'pipe-1' });
      prisma.pipeline.update.mockResolvedValue({
        id: 'pipe-1',
        name: 'Updated ETL',
        status: 'IDLE',
      });

      const result = await service.update('pipe-1', { name: 'Updated ETL' });

      expect(result.name).toBe('Updated ETL');
    });
  });

  describe('remove', () => {
    it('should delete the pipeline', async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: 'pipe-1' });
      prisma.pipeline.delete.mockResolvedValue({ id: 'pipe-1' });

      await service.remove('pipe-1');

      expect(prisma.pipeline.delete).toHaveBeenCalledWith({ where: { id: 'pipe-1' } });
    });
  });
});
