import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

function createMockPrisma(dsType = 'webhook', dsStatus = 'active') {
  return {
    dataSource: {
      findUniqueOrThrow: async () => ({ id: 'ds-1', type: dsType, status: dsStatus }),
    },
    dataPoint: {
      create: async (args: any) => ({ id: 'dp-1', ...args.data }),
    },
    deadLetterEvent: {
      create: async (args: any) => ({ id: 'dle-1', ...args.data }),
    },
  } as any;
}

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(() => {
    service = new IngestionService(createMockPrisma());
  });

  it('should ingest a webhook event', async () => {
    const result = await service.ingestWebhook('ds-1', {
      timestamp: '2024-01-01T00:00:00Z',
      dimensions: { page: '/home' },
      metrics: { views: 1 },
    });
    expect(result.dataSourceId).toBe('ds-1');
  });

  it('should use current timestamp if none provided', async () => {
    const result = await service.ingestWebhook('ds-1', {
      metrics: { views: 1 },
    });
    expect(result.timestamp).toBeDefined();
  });

  it('should reject non-webhook data source', async () => {
    service = new IngestionService(createMockPrisma('api'));
    await expect(
      service.ingestWebhook('ds-1', { metrics: { views: 1 } }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject inactive data source', async () => {
    service = new IngestionService(createMockPrisma('webhook', 'paused'));
    await expect(
      service.ingestWebhook('ds-1', { metrics: { views: 1 } }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should transform data with rename step', async () => {
    const result = await service.transform(
      { old_name: 'value' },
      [{ type: 'rename', config: { from: 'old_name', to: 'new_name' } }],
    );
    expect(result.new_name).toBe('value');
    expect(result.old_name).toBeUndefined();
  });

  it('should transform data with cast step (number)', async () => {
    const result = await service.transform(
      { count: '42' },
      [{ type: 'cast', config: { field: 'count', targetType: 'number' } }],
    );
    expect(result.count).toBe(42);
  });

  it('should transform data with cast step (string)', async () => {
    const result = await service.transform(
      { count: 42 },
      [{ type: 'cast', config: { field: 'count', targetType: 'string' } }],
    );
    expect(result.count).toBe('42');
  });

  it('should transform data with filter step (eq match)', async () => {
    const result = await service.transform(
      { status: 'active', value: 1 },
      [{ type: 'filter', config: { field: 'status', operator: 'eq', value: 'active' } }],
    );
    expect(result.status).toBe('active');
  });

  it('should transform data with filter step (eq no match)', async () => {
    const result = await service.transform(
      { status: 'inactive', value: 1 },
      [{ type: 'filter', config: { field: 'status', operator: 'eq', value: 'active' } }],
    );
    expect(result).toEqual({});
  });

  it('should transform data with derive step', async () => {
    const result = await service.transform(
      { a: 10, b: 20 },
      [{ type: 'derive', config: { field: 'total', expression: 'a + b' } }],
    );
    expect(result.total).toBe(30);
  });

  it('should handle unknown transform step types gracefully', async () => {
    const result = await service.transform(
      { value: 1 },
      [{ type: 'unknown_step', config: {} }],
    );
    expect(result.value).toBe(1);
  });
});
