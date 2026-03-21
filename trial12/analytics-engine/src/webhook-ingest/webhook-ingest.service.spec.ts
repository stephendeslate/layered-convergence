import { WebhookIngestService } from './webhook-ingest.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WebhookIngestService', () => {
  let service: WebhookIngestService;
  let mockPrisma: any;
  let mockDataPointService: any;
  let mockPipelineService: any;

  beforeEach(() => {
    mockPrisma = {
      tenant: { findFirst: vi.fn() },
      dataSource: { findFirst: vi.fn() },
    };
    mockDataPointService = {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    };
    mockPipelineService = {
      startSync: vi.fn().mockResolvedValue({ id: 'sr1' }),
      updateSyncStatus: vi.fn().mockResolvedValue({}),
      createDeadLetterEvent: vi.fn().mockResolvedValue({}),
    };
    service = new WebhookIngestService(
      mockPrisma,
      mockDataPointService,
      mockPipelineService,
    );
  });

  it('should throw NotFoundException for invalid API key', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    await expect(
      service.ingest('bad-key', { metrics: { v: 1 } }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if no webhook data source', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({
      id: 't1',
      apiKey: 'ak_test',
    });
    mockPrisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(
      service.ingest('ak_test', { metrics: { v: 1 } }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should ingest single event', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({
      id: 't1',
      apiKey: 'ak_test',
    });
    mockPrisma.dataSource.findFirst.mockResolvedValue({
      id: 'ds1',
      type: 'WEBHOOK',
    });
    const result = await service.ingest('ak_test', {
      metrics: { value: 42 },
      dimensions: { region: 'US' },
    });
    expect(result.ingested).toBe(1);
    expect(result.syncRunId).toBe('sr1');
  });

  it('should ingest batch events', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({
      id: 't1',
      apiKey: 'ak_test',
    });
    mockPrisma.dataSource.findFirst.mockResolvedValue({
      id: 'ds1',
      type: 'WEBHOOK',
    });
    const result = await service.ingest('ak_test', {
      events: [
        { metrics: { v: 1 }, dimensions: {} },
        { metrics: { v: 2 }, dimensions: {} },
      ],
    });
    expect(result.ingested).toBe(2);
  });

  it('should create dead letter event on failure', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({
      id: 't1',
      apiKey: 'ak_test',
    });
    mockPrisma.dataSource.findFirst.mockResolvedValue({
      id: 'ds1',
      type: 'WEBHOOK',
    });
    mockDataPointService.createMany.mockRejectedValue(new Error('DB error'));
    await expect(
      service.ingest('ak_test', { metrics: { v: 1 } }),
    ).rejects.toThrow('DB error');
    expect(mockPipelineService.createDeadLetterEvent).toHaveBeenCalled();
  });
});
