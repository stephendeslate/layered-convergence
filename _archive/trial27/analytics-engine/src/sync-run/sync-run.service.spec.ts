import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SyncRunService', () => {
  let service: SyncRunService;
  let prisma: {
    syncRun: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      syncRun: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        SyncRunService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SyncRunService);
  });

  describe('create', () => {
    it('should create a sync run', async () => {
      prisma.syncRun.create.mockResolvedValue({ id: 'sr-1', status: 'running' });
      const result = await service.create({ dataSourceId: 'ds-1' });
      expect(result.id).toBe('sr-1');
    });

    it('should default status to running', async () => {
      prisma.syncRun.create.mockResolvedValue({ id: 'sr-1' });
      await service.create({ dataSourceId: 'ds-1' });
      expect(prisma.syncRun.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'running' }),
        }),
      );
    });

    it('should use provided status', async () => {
      prisma.syncRun.create.mockResolvedValue({ id: 'sr-1' });
      await service.create({ dataSourceId: 'ds-1', status: 'pending' });
      expect(prisma.syncRun.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'pending' }),
        }),
      );
    });
  });

  describe('findByDataSourceId', () => {
    it('should return sync runs ordered by startedAt desc', async () => {
      prisma.syncRun.findMany.mockResolvedValue([{ id: 'sr-1' }]);
      const result = await service.findByDataSourceId('ds-1');
      expect(result).toHaveLength(1);
    });

    it('should order by startedAt descending', async () => {
      prisma.syncRun.findMany.mockResolvedValue([]);
      await service.findByDataSourceId('ds-1');
      expect(prisma.syncRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { startedAt: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return sync run by id', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      const result = await service.findOne('sr-1');
      expect(result.id).toBe('sr-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update sync run', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      prisma.syncRun.update.mockResolvedValue({ id: 'sr-1', status: 'completed' });
      const result = await service.update('sr-1', { status: 'completed' });
      expect(result.status).toBe('completed');
    });

    it('should set completedAt when status is completed', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      prisma.syncRun.update.mockResolvedValue({ id: 'sr-1' });
      await service.update('sr-1', { status: 'completed' });
      const updateData = prisma.syncRun.update.mock.calls[0][0].data;
      expect(updateData.completedAt).toBeInstanceOf(Date);
    });

    it('should set completedAt when status is failed', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      prisma.syncRun.update.mockResolvedValue({ id: 'sr-1' });
      await service.update('sr-1', { status: 'failed' });
      const updateData = prisma.syncRun.update.mock.calls[0][0].data;
      expect(updateData.completedAt).toBeInstanceOf(Date);
    });

    it('should not set completedAt for running status', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      prisma.syncRun.update.mockResolvedValue({ id: 'sr-1' });
      await service.update('sr-1', { status: 'running' });
      const updateData = prisma.syncRun.update.mock.calls[0][0].data;
      expect(updateData.completedAt).toBeUndefined();
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { status: 'completed' })).rejects.toThrow(NotFoundException);
    });
  });
});
