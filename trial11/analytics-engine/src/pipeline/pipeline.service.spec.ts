import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dataSource: {
    findUniqueOrThrow: vi.fn(),
  },
  syncRun: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  dataPoint: {
    create: vi.fn(),
  },
  deadLetterEvent: {
    create: vi.fn(),
  },
};

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('triggerSync', () => {
    it('should create a sync run with RUNNING status', async () => {
      const dataSource = {
        id: 'ds-1',
        tenantId: 'tenant-1',
        dataSourceConfig: {},
      };
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue(dataSource);
      mockPrisma.syncRun.create.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });

      const result = await service.triggerSync('ds-1', 'tenant-1');

      expect(result.status).toBe('RUNNING');
      expect(mockPrisma.syncRun.create).toHaveBeenCalledWith({
        data: { dataSourceId: 'ds-1', status: 'RUNNING' },
      });
    });
  });

  describe('validateTransition', () => {
    it('should allow RUNNING → COMPLETED', () => {
      expect(() =>
        service.validateTransition('RUNNING' as any, 'COMPLETED' as any),
      ).not.toThrow();
    });

    it('should allow RUNNING → FAILED', () => {
      expect(() =>
        service.validateTransition('RUNNING' as any, 'FAILED' as any),
      ).not.toThrow();
    });

    it('should reject COMPLETED → RUNNING', () => {
      expect(() =>
        service.validateTransition('COMPLETED' as any, 'RUNNING' as any),
      ).toThrow(BadRequestException);
    });

    it('should reject FAILED → COMPLETED', () => {
      expect(() =>
        service.validateTransition('FAILED' as any, 'COMPLETED' as any),
      ).toThrow(BadRequestException);
    });

    it('should reject COMPLETED → FAILED', () => {
      expect(() =>
        service.validateTransition('COMPLETED' as any, 'FAILED' as any),
      ).toThrow(BadRequestException);
    });
  });

  describe('transitionStatus', () => {
    it('should transition from RUNNING to COMPLETED', async () => {
      const syncRun = { id: 'sr-1', status: 'RUNNING' };
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue(syncRun);
      mockPrisma.syncRun.update.mockResolvedValue({
        ...syncRun,
        status: 'COMPLETED',
        rowsIngested: 5,
      });

      const result = await service.transitionStatus(
        'sr-1',
        'RUNNING' as any,
        'COMPLETED' as any,
        5,
      );

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw if current status does not match expected from', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({
        id: 'sr-1',
        status: 'COMPLETED',
      });

      await expect(
        service.transitionStatus(
          'sr-1',
          'RUNNING' as any,
          'COMPLETED' as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSyncRuns', () => {
    it('should return sync runs for a data source', async () => {
      const runs = [{ id: 'sr-1', status: 'COMPLETED' }];
      mockPrisma.syncRun.findMany.mockResolvedValue(runs);

      const result = await service.getSyncRuns('ds-1');

      expect(result).toEqual(runs);
      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds-1' },
        orderBy: { startedAt: 'desc' },
      });
    });
  });

  describe('executeSyncInBackground', () => {
    it('should ingest data points and transition to COMPLETED', async () => {
      const dataSource = {
        id: 'ds-1',
        tenantId: 'tenant-1',
        dataSourceConfig: null,
      };
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue(dataSource);
      mockPrisma.dataPoint.create.mockResolvedValue({});
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr-1',
        status: 'COMPLETED',
      });

      await service.executeSyncInBackground('sr-1', 'ds-1', 'tenant-1');

      expect(mockPrisma.dataPoint.create).toHaveBeenCalled();
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
    });

    it('should create dead letter events on data point errors', async () => {
      const dataSource = {
        id: 'ds-1',
        tenantId: 'tenant-1',
        dataSourceConfig: null,
      };
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue(dataSource);
      mockPrisma.dataPoint.create.mockRejectedValue(new Error('Invalid data'));
      mockPrisma.deadLetterEvent.create.mockResolvedValue({});
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });
      mockPrisma.syncRun.update.mockResolvedValue({
        id: 'sr-1',
        status: 'COMPLETED',
      });

      await service.executeSyncInBackground('sr-1', 'ds-1', 'tenant-1');

      expect(mockPrisma.deadLetterEvent.create).toHaveBeenCalled();
    });
  });
});
