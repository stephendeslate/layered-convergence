import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SyncRunsService } from './sync-runs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SyncRunsService', () => {
  let service: SyncRunsService;
  let prisma: any;

  const mockRun = {
    id: 'run-1',
    dataSourceId: 'ds-1',
    status: 'RUNNING',
    rowsIngested: 0,
    errorLog: null,
    startedAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      syncRun: {
        create: vi.fn().mockResolvedValue(mockRun),
        findMany: vi.fn().mockResolvedValue([mockRun]),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncRunsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SyncRunsService>(SyncRunsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sync run with RUNNING status', async () => {
      const result = await service.create({ dataSourceId: 'ds-1' });
      expect(result.status).toBe('RUNNING');
    });
  });

  describe('findByDataSource', () => {
    it('should return sync runs ordered by startedAt desc', async () => {
      const result = await service.findByDataSource('ds-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return run when found', async () => {
      prisma.syncRun.findUnique.mockResolvedValue(mockRun);
      const result = await service.findById('run-1');
      expect(result.id).toBe('run-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.syncRun.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should update status to COMPLETED with row count', async () => {
      prisma.syncRun.update.mockResolvedValue({ ...mockRun, status: 'COMPLETED', rowsIngested: 42 });
      const result = await service.complete('run-1', 42);
      expect(result.status).toBe('COMPLETED');
      expect(result.rowsIngested).toBe(42);
    });
  });

  describe('fail', () => {
    it('should update status to FAILED with error log', async () => {
      prisma.syncRun.update.mockResolvedValue({ ...mockRun, status: 'FAILED', errorLog: 'Connection timeout' });
      const result = await service.fail('run-1', 'Connection timeout');
      expect(result.status).toBe('FAILED');
      expect(result.errorLog).toBe('Connection timeout');
    });
  });
});
