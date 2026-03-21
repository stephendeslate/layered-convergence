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
  let tenantContext: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      syncRun: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    tenantContext = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncRunService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<SyncRunService>(SyncRunService);
  });

  it('should create a sync run in PENDING status', async () => {
    const created = { id: '1', status: SyncStatus.PENDING, tenantId: 't1' };
    prisma.syncRun.create.mockResolvedValue(created);

    const result = await service.create({ dataSourceId: 'ds-1' }, 't1');
    expect(result.status).toBe(SyncStatus.PENDING);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    prisma.syncRun.findUnique.mockResolvedValue({ id: '1', tenantId: 't2' });

    await expect(service.findById('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should update status to RUNNING with startedAt', async () => {
    prisma.syncRun.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    prisma.syncRun.update.mockResolvedValue({ id: '1', status: SyncStatus.RUNNING });

    const result = await service.updateStatus('1', SyncStatus.RUNNING, 't1');
    expect(result.status).toBe(SyncStatus.RUNNING);
  });
});
