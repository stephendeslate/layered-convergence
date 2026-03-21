import { describe, it, expect, beforeEach } from 'vitest';
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a sync run with default status', async () => {
    prisma.syncRun.create.mockResolvedValue({ id: 'sr1', status: 'running' });
    const result = await service.create({ dataSourceId: 'ds1' });
    expect(result.status).toBe('running');
    expect(prisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds1', status: 'running' },
    });
  });

  it('should create a sync run with custom status', async () => {
    prisma.syncRun.create.mockResolvedValue({ id: 'sr1', status: 'pending' });
    await service.create({ dataSourceId: 'ds1', status: 'pending' });
    expect(prisma.syncRun.create).toHaveBeenCalledWith({
      data: { dataSourceId: 'ds1', status: 'pending' },
    });
  });

  it('should find sync runs by data source id', async () => {
    prisma.syncRun.findMany.mockResolvedValue([{ id: 'sr1' }]);
    const result = await service.findByDataSourceId('ds1');
    expect(result).toHaveLength(1);
  });

  it('should find one sync run', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1' });
    const result = await service.findOne('sr1');
    expect(result.id).toBe('sr1');
  });

  it('should throw NotFoundException when sync run not found', async () => {
    prisma.syncRun.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('should update a sync run', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', status: 'running' });
    prisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'completed' });
    const result = await service.update('sr1', { status: 'completed' });
    expect(result.status).toBe('completed');
  });

  it('should set completedAt when status is completed', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', status: 'running' });
    prisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'completed' });
    await service.update('sr1', { status: 'completed' });
    const call = prisma.syncRun.update.mock.calls[0][0];
    expect(call.data.completedAt).toBeInstanceOf(Date);
  });

  it('should set completedAt when status is failed', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', status: 'running' });
    prisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'failed' });
    await service.update('sr1', { status: 'failed' });
    const call = prisma.syncRun.update.mock.calls[0][0];
    expect(call.data.completedAt).toBeInstanceOf(Date);
  });

  it('should not set completedAt for other statuses', async () => {
    prisma.syncRun.findFirst.mockResolvedValue({ id: 'sr1', status: 'running' });
    prisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'running' });
    await service.update('sr1', { rowsIngested: 100 });
    const call = prisma.syncRun.update.mock.calls[0][0];
    expect(call.data.completedAt).toBeUndefined();
  });
});
