import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookIngestService } from './webhook-ingest.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebhookIngestService(
      mockPrisma as any,
      mockDataPointService as any,
      mockPipelineService as any,
    );
  });

  it('should throw NotFoundException for invalid api key', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    await expect(service.ingest('bad-key', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException if no webhook data source', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1' });
    mockPrisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.ingest('ak_valid', {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should ingest single event payload', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1' });
    mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
    mockPipelineService.startSync.mockResolvedValue({ id: 'sr-1' });
    mockDataPointService.createMany.mockResolvedValue({ count: 1 });
    mockPipelineService.updateSyncStatus.mockResolvedValue({});

    const result = await service.ingest('ak_valid', {
      metrics: { views: 10 },
    });
    expect(result.ingested).toBe(1);
    expect(result.syncRunId).toBe('sr-1');
  });

  it('should ingest array of events', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1' });
    mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
    mockPipelineService.startSync.mockResolvedValue({ id: 'sr-1' });
    mockDataPointService.createMany.mockResolvedValue({ count: 3 });
    mockPipelineService.updateSyncStatus.mockResolvedValue({});

    const result = await service.ingest('ak_valid', {
      events: [
        { metrics: { a: 1 } },
        { metrics: { a: 2 } },
        { metrics: { a: 3 } },
      ],
    });
    expect(result.ingested).toBe(3);
  });

  it('should mark sync as COMPLETED on success', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1' });
    mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
    mockPipelineService.startSync.mockResolvedValue({ id: 'sr-1' });
    mockDataPointService.createMany.mockResolvedValue({ count: 1 });
    mockPipelineService.updateSyncStatus.mockResolvedValue({});

    await service.ingest('ak_valid', { metrics: { x: 1 } });
    expect(mockPipelineService.updateSyncStatus).toHaveBeenCalledWith(
      'sr-1',
      'COMPLETED',
      1,
    );
  });

  it('should mark sync as FAILED and create dead letter on error', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1' });
    mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
    mockPipelineService.startSync.mockResolvedValue({ id: 'sr-1' });
    mockDataPointService.createMany.mockRejectedValue(
      new Error('DB connection lost'),
    );
    mockPipelineService.updateSyncStatus.mockResolvedValue({});
    mockPipelineService.createDeadLetterEvent.mockResolvedValue({});

    await expect(
      service.ingest('ak_valid', { metrics: { x: 1 } }),
    ).rejects.toThrow('DB connection lost');

    expect(mockPipelineService.updateSyncStatus).toHaveBeenCalledWith(
      'sr-1',
      'FAILED',
      0,
      'DB connection lost',
    );
    expect(mockPipelineService.createDeadLetterEvent).toHaveBeenCalled();
  });

  it('should look up tenant by apiKey', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1' });
    mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
    mockPipelineService.startSync.mockResolvedValue({ id: 'sr-1' });
    mockDataPointService.createMany.mockResolvedValue({ count: 1 });
    mockPipelineService.updateSyncStatus.mockResolvedValue({});

    await service.ingest('ak_key123', { metrics: {} });
    expect(mockPrisma.tenant.findFirst).toHaveBeenCalledWith({
      where: { apiKey: 'ak_key123' },
    });
  });

  it('should look up WEBHOOK type data source', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1' });
    mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
    mockPipelineService.startSync.mockResolvedValue({ id: 'sr-1' });
    mockDataPointService.createMany.mockResolvedValue({ count: 1 });
    mockPipelineService.updateSyncStatus.mockResolvedValue({});

    await service.ingest('ak_key', { metrics: {} });
    expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
      where: { tenantId: 't-1', type: 'WEBHOOK' },
    });
  });
});
