import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WebhookIngestService } from './webhook-ingest.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DataPointService } from '../datapoint/datapoint.service.js';
import { PipelineService } from '../pipeline/pipeline.service.js';

const mockPrisma = {
  tenant: { findFirst: vi.fn() },
  dataSource: { findFirst: vi.fn() },
};

const mockDataPointService = {
  createMany: vi.fn(),
};

const mockPipelineService = {
  startSync: vi.fn(),
  updateSyncStatus: vi.fn(),
  createDeadLetterEvent: vi.fn(),
};

describe('WebhookIngestService', () => {
  let service: WebhookIngestService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WebhookIngestService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DataPointService, useValue: mockDataPointService },
        { provide: PipelineService, useValue: mockPipelineService },
      ],
    }).compile();

    service = module.get(WebhookIngestService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ingest', () => {
    const apiKey = 'ak_test123';
    const tenant = { id: 'tenant-1', apiKey };
    const dataSource = { id: 'ds1', tenantId: 'tenant-1', type: 'WEBHOOK' };
    const syncRun = { id: 'sr1' };

    beforeEach(() => {
      mockPrisma.tenant.findFirst.mockResolvedValue(tenant);
      mockPrisma.dataSource.findFirst.mockResolvedValue(dataSource);
      mockPipelineService.startSync.mockResolvedValue(syncRun);
      mockDataPointService.createMany.mockResolvedValue({ count: 1 });
      mockPipelineService.updateSyncStatus.mockResolvedValue({});
    });

    it('should ingest a single event payload', async () => {
      const payload = {
        timestamp: '2025-01-01T00:00:00Z',
        dimensions: { region: 'us' },
        metrics: { revenue: 100 },
      };

      const result = await service.ingest(apiKey, payload);
      expect(result.ingested).toBe(1);
      expect(result.syncRunId).toBe('sr1');
    });

    it('should ingest an array of events', async () => {
      const payload = {
        events: [
          { dimensions: { region: 'us' }, metrics: { revenue: 100 } },
          { dimensions: { region: 'eu' }, metrics: { revenue: 200 } },
        ],
      };

      const result = await service.ingest(apiKey, payload);
      expect(result.ingested).toBe(2);
    });

    it('should throw NotFoundException for invalid API key', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);

      await expect(service.ingest('bad_key', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if no webhook data source configured', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.ingest(apiKey, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create dead letter event on ingestion failure', async () => {
      mockDataPointService.createMany.mockRejectedValue(new Error('DB error'));

      await expect(service.ingest(apiKey, { metrics: {} })).rejects.toThrow(
        'DB error',
      );
      expect(mockPipelineService.updateSyncStatus).toHaveBeenCalledWith(
        'sr1',
        'FAILED',
        0,
        'DB error',
      );
      expect(mockPipelineService.createDeadLetterEvent).toHaveBeenCalled();
    });

    it('should mark sync run as COMPLETED on success', async () => {
      await service.ingest(apiKey, { metrics: { x: 1 } });

      expect(mockPipelineService.updateSyncStatus).toHaveBeenCalledWith(
        'sr1',
        'COMPLETED',
        1,
      );
    });
  });
});
