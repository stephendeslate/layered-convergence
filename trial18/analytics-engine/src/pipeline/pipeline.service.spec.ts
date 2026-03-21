import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: {
    pipeline: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      pipeline: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new PipelineService(prisma as unknown as PrismaService);
  });

  it('should return all pipelines for a tenant', async () => {
    const pipelines = [{ id: 'p1', tenantId: 't1', status: 'DRAFT' }];
    prisma.pipeline.findMany.mockResolvedValue(pipelines);

    const result = await service.findAll('t1');

    expect(result).toEqual(pipelines);
  });

  it('should throw NotFoundException when pipeline not found', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a pipeline', async () => {
    const created = { id: 'p1', tenantId: 't1', name: 'ETL', status: 'DRAFT' };
    prisma.pipeline.create.mockResolvedValue(created);

    const result = await service.create('t1', {
      name: 'ETL',
      config: { transform: 'aggregate' },
      dataSourceId: 'ds1',
    });

    expect(result).toEqual(created);
  });

  it('should allow DRAFT -> ACTIVE transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', tenantId: 't1', status: 'DRAFT' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'ACTIVE' });

    const result = await service.transition('t1', 'p1', { status: 'ACTIVE' as const });

    expect(result.status).toBe('ACTIVE');
  });

  it('should reject DRAFT -> COMPLETED transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', tenantId: 't1', status: 'DRAFT' });

    await expect(
      service.transition('t1', 'p1', { status: 'COMPLETED' as const }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow ACTIVE -> PAUSED transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', tenantId: 't1', status: 'ACTIVE' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'PAUSED' });

    const result = await service.transition('t1', 'p1', { status: 'PAUSED' as const });

    expect(result.status).toBe('PAUSED');
  });

  it('should allow PAUSED -> ACTIVE but not PAUSED -> FAILED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', tenantId: 't1', status: 'PAUSED' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'ACTIVE' });

    const result = await service.transition('t1', 'p1', { status: 'ACTIVE' as const });
    expect(result.status).toBe('ACTIVE');

    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', tenantId: 't1', status: 'PAUSED' });

    await expect(
      service.transition('t1', 'p1', { status: 'FAILED' as const }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow FAILED -> DRAFT and COMPLETED -> DRAFT', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', tenantId: 't1', status: 'FAILED' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'DRAFT' });

    await service.transition('t1', 'p1', { status: 'DRAFT' as const });

    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', tenantId: 't1', status: 'COMPLETED' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'DRAFT' });

    await service.transition('t1', 'p1', { status: 'DRAFT' as const });
  });
});
