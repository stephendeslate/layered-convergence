import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SyncRunService', () => {
  let service: SyncRunService;
  let prisma: {
    dataSource: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    syncRun: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';

  const mockSyncRun = {
    id: 'sr-1',
    tenantId,
    dataSourceId: 'ds-1',
    status: 'pending',
    recordsProcessed: null,
    errorMessage: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    dataSource: { id: 'ds-1', name: 'Test DB' },
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        findFirst: vi.fn(),
      },
      syncRun: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncRunService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SyncRunService>(SyncRunService);
  });

  describe('create', () => {
    it('should create a sync run with pending status', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.syncRun.create.mockResolvedValue(mockSyncRun);

      const result = await service.create(tenantId, { dataSourceId: 'ds-1' });

      expect(result.status).toBe('pending');
      expect(prisma.syncRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, status: 'pending' }),
      });
    });

    it('should throw NotFoundException if data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, { dataSourceId: 'ds-999' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify data source belongs to tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, { dataSourceId: 'ds-other' }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-other', tenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all sync runs for tenant', async () => {
      prisma.syncRun.findMany.mockResolvedValue([mockSyncRun]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(1);
      expect(prisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { dataSource: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by dataSourceId when provided', async () => {
      prisma.syncRun.findMany.mockResolvedValue([mockSyncRun]);

      await service.findAll(tenantId, 'ds-1');

      expect(prisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { tenantId, dataSourceId: 'ds-1' },
        include: { dataSource: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a sync run', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(mockSyncRun);

      const result = await service.findOne(tenantId, 'sr-1');

      expect(result.id).toBe('sr-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'sr-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update sync run status', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(mockSyncRun);
      prisma.syncRun.update.mockResolvedValue({ ...mockSyncRun, status: 'running' });

      const result = await service.update(tenantId, 'sr-1', { status: 'running' });

      expect(result.status).toBe('running');
    });

    it('should set completedAt when status is completed', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(mockSyncRun);
      prisma.syncRun.update.mockResolvedValue({ ...mockSyncRun, status: 'completed' });

      await service.update(tenantId, 'sr-1', { status: 'completed' });

      expect(prisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({
          status: 'completed',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should set completedAt when status is failed', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(mockSyncRun);
      prisma.syncRun.update.mockResolvedValue({ ...mockSyncRun, status: 'failed' });

      await service.update(tenantId, 'sr-1', { status: 'failed' });

      expect(prisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({
          status: 'failed',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should update recordsProcessed', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(mockSyncRun);
      prisma.syncRun.update.mockResolvedValue({ ...mockSyncRun, recordsProcessed: 150 });

      await service.update(tenantId, 'sr-1', { recordsProcessed: 150 });

      expect(prisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({ recordsProcessed: 150 }),
      });
    });

    it('should throw NotFoundException if sync run not found', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'sr-999', { status: 'running' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLatestByDataSource', () => {
    it('should return the latest sync run for a data source', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(mockSyncRun);

      const result = await service.getLatestByDataSource(tenantId, 'ds-1');

      expect(result).toEqual(mockSyncRun);
      expect(prisma.syncRun.findFirst).toHaveBeenCalledWith({
        where: { tenantId, dataSourceId: 'ds-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return null if no sync runs exist', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);

      const result = await service.getLatestByDataSource(tenantId, 'ds-1');

      expect(result).toBeNull();
    });
  });
});
