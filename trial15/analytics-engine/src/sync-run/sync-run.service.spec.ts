import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  syncRun: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('SyncRunService', () => {
  let service: SyncRunService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SyncRunService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sync run with defaults', async () => {
      const dto = { pipelineId: 'pipe-1' };
      const expected = { id: 'sr-1', ...dto, tenantId: 'tenant-1', status: 'pending', recordCount: 0 };
      mockPrisma.syncRun.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.syncRun.create).toHaveBeenCalledWith({
        data: {
          pipelineId: 'pipe-1',
          tenantId: 'tenant-1',
          status: 'pending',
          recordCount: 0,
        },
      });
    });

    it('should create a sync run with custom status', async () => {
      const dto = { pipelineId: 'pipe-1', status: 'running', recordCount: 100 };
      mockPrisma.syncRun.create.mockResolvedValue({ id: 'sr-1', ...dto });

      await service.create('tenant-1', dto);

      expect(mockPrisma.syncRun.create).toHaveBeenCalledWith({
        data: {
          pipelineId: 'pipe-1',
          tenantId: 'tenant-1',
          status: 'running',
          recordCount: 100,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all sync runs for a tenant', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([{ id: 'sr-1' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual([{ id: 'sr-1' }]);
    });

    it('should filter by pipelineId when provided', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1', 'pipe-1');

      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', pipelineId: 'pipe-1' },
        orderBy: { startedAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a sync run by id and tenantId', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });

      const result = await service.findOne('tenant-1', 'sr-1');

      expect(result.id).toBe('sr-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'sr-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update sync run status', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: 'sr-1', status: 'running' });

      const result = await service.updateStatus('tenant-1', 'sr-1', 'running');

      expect(result.status).toBe('running');
    });

    it('should set completedAt when status is completed', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: 'sr-1', status: 'completed' });

      await service.updateStatus('tenant-1', 'sr-1', 'completed', { recordCount: 500 });

      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({
          status: 'completed',
          recordCount: 500,
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should set completedAt and errorLog when status is failed', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: 'sr-1', status: 'failed' });

      await service.updateStatus('tenant-1', 'sr-1', 'failed', { errorLog: 'Connection refused' });

      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({
          status: 'failed',
          errorLog: 'Connection refused',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should throw NotFoundException if sync run not found', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('tenant-1', 'sr-999', 'running'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a sync run', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue({ id: 'sr-1' });
      mockPrisma.syncRun.delete.mockResolvedValue({ id: 'sr-1' });

      const result = await service.remove('tenant-1', 'sr-1');

      expect(result).toEqual({ id: 'sr-1' });
    });

    it('should throw NotFoundException if sync run to delete not found', async () => {
      mockPrisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'sr-999')).rejects.toThrow(NotFoundException);
    });
  });
});
