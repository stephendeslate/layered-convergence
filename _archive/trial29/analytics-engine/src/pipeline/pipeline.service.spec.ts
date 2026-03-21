import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dataSource: {
    findFirst: vi.fn(),
  },
  syncRun: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  deadLetterEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('PipelineService', () => {
  let service: PipelineService;
  const tenantId = 'tenant-uuid-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(PipelineService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startSync', () => {
    it('should create a new sync run in RUNNING status', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId });
      mockPrisma.syncRun.create.mockResolvedValue({
        id: 'sr1',
        dataSourceId: 'ds1',
        status: 'RUNNING',
      });

      const result = await service.startSync(tenantId, 'ds1');
      expect(result.status).toBe('RUNNING');
      expect(mockPrisma.syncRun.create).toHaveBeenCalledWith({
        data: { dataSourceId: 'ds1', status: 'RUNNING' },
      });
    });

    it('should throw NotFoundException if data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.startSync(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSyncStatus', () => {
    it('should transition from RUNNING to COMPLETED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr1',
        status: 'COMPLETED',
        rowsIngested: 100,
      });

      const result = await service.updateSyncStatus(
        'sr1',
        'COMPLETED' as any,
        100,
      );
      expect(result.status).toBe('COMPLETED');
    });

    it('should transition from RUNNING to FAILED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr1',
        status: 'FAILED',
        errorLog: 'timeout',
      });

      const result = await service.updateSyncStatus(
        'sr1',
        'FAILED' as any,
        0,
        'timeout',
      );
      expect(result.status).toBe('FAILED');
    });

    it('should reject invalid transition COMPLETED to RUNNING', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'COMPLETED',
      });

      await expect(
        service.updateSyncStatus('sr1', 'RUNNING' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition FAILED to COMPLETED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'FAILED',
      });

      await expect(
        service.updateSyncStatus('sr1', 'COMPLETED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition COMPLETED to FAILED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'COMPLETED',
      });

      await expect(
        service.updateSyncStatus('sr1', 'FAILED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if sync run not found', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSyncStatus('missing', 'COMPLETED' as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'COMPLETED' });

      await service.updateSyncStatus('sr1', 'COMPLETED' as any);
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr1' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should set completedAt when transitioning to FAILED', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({
        id: 'sr1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({ id: 'sr1', status: 'FAILED' });

      await service.updateSyncStatus('sr1', 'FAILED' as any, 0, 'err');
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith({
        where: { id: 'sr1' },
        data: expect.objectContaining({
          status: 'FAILED',
          completedAt: expect.any(Date),
          errorLog: 'err',
        }),
      });
    });
  });

  describe('getSyncRuns', () => {
    it('should return sync runs ordered by startedAt desc', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([
        { id: 'sr2' },
        { id: 'sr1' },
      ]);

      const result = await service.getSyncRuns('ds1');
      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds1' },
        orderBy: { startedAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getSyncRun', () => {
    it('should return a sync run by id', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue({ id: 'sr1' });
      const result = await service.getSyncRun('sr1');
      expect(result.id).toBe('sr1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.syncRun.findUnique.mockResolvedValue(null);
      await expect(service.getSyncRun('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createDeadLetterEvent', () => {
    it('should create a dead letter event', async () => {
      mockPrisma.deadLetterEvent.create.mockResolvedValue({
        id: 'dle1',
        dataSourceId: 'ds1',
        payload: { bad: 'data' },
        errorReason: 'parse error',
      });

      const result = await service.createDeadLetterEvent(
        'ds1',
        { bad: 'data' },
        'parse error',
      );
      expect(result.errorReason).toBe('parse error');
    });
  });

  describe('getDeadLetterEvents', () => {
    it('should return dead letter events ordered by createdAt desc', async () => {
      mockPrisma.deadLetterEvent.findMany.mockResolvedValue([{ id: 'dle1' }]);

      const result = await service.getDeadLetterEvents('ds1');
      expect(mockPrisma.deadLetterEvent.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('retryDeadLetterEvent', () => {
    it('should mark a dead letter event as retried', async () => {
      mockPrisma.deadLetterEvent.findUnique.mockResolvedValue({ id: 'dle1' });
      mockPrisma.deadLetterEvent.update.mockResolvedValue({
        id: 'dle1',
        retriedAt: new Date(),
      });

      const result = await service.retryDeadLetterEvent('dle1');
      expect(result.retriedAt).toBeDefined();
    });

    it('should throw NotFoundException if dead letter event not found', async () => {
      mockPrisma.deadLetterEvent.findUnique.mockResolvedValue(null);

      await expect(service.retryDeadLetterEvent('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
