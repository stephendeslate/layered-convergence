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

  it('should find all pipelines for a tenant', async () => {
    prisma.pipeline.findMany.mockResolvedValue([]);
    const result = await service.findAll('t1');
    expect(result).toEqual([]);
    expect(prisma.pipeline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
  });

  it('should throw NotFoundException when pipeline not found', async () => {
    prisma.pipeline.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create pipeline in DRAFT status', async () => {
    const created = { id: 'p1', name: 'Test', status: 'DRAFT', tenantId: 't1' };
    prisma.pipeline.create.mockResolvedValue(created);

    const result = await service.create('t1', { name: 'Test', dataSourceId: 'ds1' });
    expect(result.name).toBe('Test');
  });

  it('should transition DRAFT to ACTIVE', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'DRAFT', tenantId: 't1' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'ACTIVE' });

    const result = await service.transition('t1', 'p1', { status: 'ACTIVE' as never });
    expect(result.status).toBe('ACTIVE');
  });

  it('should reject invalid transition DRAFT to PAUSED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'DRAFT', tenantId: 't1' });

    await expect(
      service.transition('t1', 'p1', { status: 'PAUSED' as never }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition DRAFT to ARCHIVED', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'DRAFT', tenantId: 't1' });

    await expect(
      service.transition('t1', 'p1', { status: 'ARCHIVED' as never }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow ACTIVE to PAUSED transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'ACTIVE', tenantId: 't1' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'PAUSED' });

    const result = await service.transition('t1', 'p1', { status: 'PAUSED' as never });
    expect(result.status).toBe('PAUSED');
  });

  it('should allow ARCHIVED to DRAFT transition', async () => {
    prisma.pipeline.findFirst.mockResolvedValue({ id: 'p1', status: 'ARCHIVED', tenantId: 't1' });
    prisma.pipeline.update.mockResolvedValue({ id: 'p1', status: 'DRAFT' });

    const result = await service.transition('t1', 'p1', { status: 'DRAFT' as never });
    expect(result.status).toBe('DRAFT');
  });
});
