import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
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
    dataSource: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';
  const otherTenantId = 'tenant-2';

  const mockSyncRun = {
    id: 'sr-1',
    tenantId,
    dataSourceId: 'ds-1',
    status: 'pending',
    startedAt: new Date(),
    completedAt: null,
    recordsProcessed: 0,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      syncRun: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      dataSource: {
        findFirst: vi.fn(),
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
    it('should create a sync run', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.syncRun.create.mockResolvedValue(mockSyncRun);

      const result = await service.create(tenantId, { dataSourceId: 'ds-1' });

      expect(result.status).toBe('pending');
      expect(result.dataSourceId).toBe('ds-1');
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
        service.create(otherTenantId, { dataSourceId: 'ds-1' }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId: otherTenantId },
      });
    });

    it('should create with pending status', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.syncRun.create.mockResolvedValue(mockSyncRun);

      await service.create(tenantId, { dataSourceId: 'ds-1' });

      expect(prisma.syncRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'pending' }),
      });
    });

    it('should include tenantId in created sync run', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.syncRun.create.mockResolvedValue(mockSyncRun);

      await service.create(tenantId, { dataSourceId: 'ds-1' });

      expect(prisma.syncRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all sync runs for tenant', async () => {
      prisma.syncRun.findMany.mockResolvedValue([
        mockSyncRun,
        { ...mockSyncRun, id: 'sr-2' },
      ]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(2);
    });

    it('should filter by dataSourceId when provided', async () => {
      prisma.syncRun.findMany.mockResolvedValue([]);

      await service.findAll(tenantId, 'ds-1');

      expect(prisma.syncRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, dataSourceId: 'ds-1' },
        }),
      );
    });

    it('should not filter by dataSourceId when not provided', async () => {
      prisma.syncRun.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.syncRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should include data source info', async () => {
      prisma.syncRun.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.syncRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ dataSource: expect.any(Object) }),
        }),
      );
    });

    it('should order by createdAt desc', async () => {
      prisma.syncRun.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.syncRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a sync run', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({
        ...mockSyncRun,
        dataSource: { id: 'ds-1' },
      });

      const result = await service.findOne(tenantId, 'sr-1');

      expect(result.id).toBe('sr-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'sr-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should filter by tenantId for isolation', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(service.findOne(otherTenantId, 'sr-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.syncRun.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sr-1', tenantId: otherTenantId },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update status', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({
        ...mockSyncRun,
        dataSource: { id: 'ds-1' },
      });
      prisma.syncRun.update.mockResolvedValue({
        ...mockSyncRun,
        status: 'running',
      });

      const result = await service.update(tenantId, 'sr-1', {
        status: 'running',
      });

      expect(result.status).toBe('running');
    });

    it('should set completedAt when status is completed', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({
        ...mockSyncRun,
        dataSource: { id: 'ds-1' },
      });
      prisma.syncRun.update.mockResolvedValue({
        ...mockSyncRun,
        status: 'completed',
        completedAt: new Date(),
      });

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
      prisma.syncRun.findFirst.mockResolvedValue({
        ...mockSyncRun,
        dataSource: { id: 'ds-1' },
      });
      prisma.syncRun.update.mockResolvedValue({
        ...mockSyncRun,
        status: 'failed',
      });

      await service.update(tenantId, 'sr-1', { status: 'failed' });

      expect(prisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should update records processed count', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({
        ...mockSyncRun,
        dataSource: { id: 'ds-1' },
      });
      prisma.syncRun.update.mockResolvedValue({
        ...mockSyncRun,
        recordsProcessed: 500,
      });

      await service.update(tenantId, 'sr-1', { recordsProcessed: 500 });

      expect(prisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({ recordsProcessed: 500 }),
      });
    });

    it('should update error message', async () => {
      prisma.syncRun.findFirst.mockResolvedValue({
        ...mockSyncRun,
        dataSource: { id: 'ds-1' },
      });
      prisma.syncRun.update.mockResolvedValue({
        ...mockSyncRun,
        errorMessage: 'Connection timeout',
      });

      await service.update(tenantId, 'sr-1', {
        errorMessage: 'Connection timeout',
      });

      expect(prisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr-1' },
        data: expect.objectContaining({ errorMessage: 'Connection timeout' }),
      });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'sr-999', { status: 'running' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent updating sync run from another tenant', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(null);

      await expect(
        service.update(otherTenantId, 'sr-1', { status: 'running' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLatestByDataSource', () => {
    it('should return the latest sync run', async () => {
      prisma.syncRun.findFirst.mockResolvedValue(mockSyncRun);

      const result = await service.getLatestByDataSource(tenantId, 'ds-1');

      expect(result).toBeDefined();
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
