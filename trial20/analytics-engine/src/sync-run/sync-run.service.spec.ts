import { Test, TestingModule } from '@nestjs/testing';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { NotFoundException } from '@nestjs/common';
import { SyncStatus } from '@prisma/client';

describe('SyncRunService', () => {
  let service: SyncRunService;
  let prisma: {
    syncRun: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
  };
  let tenantCtx: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      syncRun: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    tenantCtx = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncRunService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantCtx },
      ],
    }).compile();

    service = module.get<SyncRunService>(SyncRunService);
  });

  it('should find sync runs by data source', async () => {
    prisma.syncRun.findMany.mockResolvedValue([{ id: '1', status: SyncStatus.PENDING }]);
    const result = await service.findByDataSource('ds-1', 'tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException for missing sync run', async () => {
    prisma.syncRun.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a sync run', async () => {
    prisma.syncRun.create.mockResolvedValue({
      id: '1',
      status: SyncStatus.PENDING,
      tenantId: 'tenant-1',
    });
    const result = await service.create({ dataSourceId: 'ds-1' }, 'tenant-1');
    expect(result.status).toBe(SyncStatus.PENDING);
  });

  it('should update status to RUNNING with startedAt', async () => {
    prisma.syncRun.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    prisma.syncRun.update.mockResolvedValue({ id: '1', status: SyncStatus.RUNNING });
    const result = await service.updateStatus('1', SyncStatus.RUNNING, 'tenant-1');
    expect(result.status).toBe(SyncStatus.RUNNING);
    expect(prisma.syncRun.update.mock.calls[0][0].data.startedAt).toBeDefined();
  });

  it('should update status to FAILED with error and completedAt', async () => {
    prisma.syncRun.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    prisma.syncRun.update.mockResolvedValue({ id: '1', status: SyncStatus.FAILED });
    await service.updateStatus('1', SyncStatus.FAILED, 'tenant-1', 'Connection timeout');
    const updateArgs = prisma.syncRun.update.mock.calls[0][0].data;
    expect(updateArgs.completedAt).toBeDefined();
    expect(updateArgs.error).toBe('Connection timeout');
  });
});
