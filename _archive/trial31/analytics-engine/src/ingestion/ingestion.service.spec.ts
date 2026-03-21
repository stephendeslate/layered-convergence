import { BadRequestException } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

const mockPrisma = {
  dataSource: {
    findUniqueOrThrow: vi.fn(),
  },
  dataPoint: {
    create: vi.fn(),
  },
  deadLetterEvent: {
    create: vi.fn(),
  },
};

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(() => {
    service = new IngestionService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('ingestWebhook', () => {
    it('should create a data point for a valid webhook source', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'webhook', status: 'active',
      });
      mockPrisma.dataPoint.create.mockResolvedValue({ id: 'dp1' });
      const result = await service.ingestWebhook('ds1', { metrics: { views: 1 } });
      expect(result.id).toBe('dp1');
    });

    it('should throw if data source is not webhook type', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'api', status: 'active',
      });
      await expect(service.ingestWebhook('ds1', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw if data source is not active', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'webhook', status: 'paused',
      });
      await expect(service.ingestWebhook('ds1', {})).rejects.toThrow(BadRequestException);
    });

    it('should use current timestamp if not provided', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'webhook', status: 'active',
      });
      mockPrisma.dataPoint.create.mockResolvedValue({ id: 'dp1' });
      await service.ingestWebhook('ds1', { metrics: { views: 1 } });
      const call = mockPrisma.dataPoint.create.mock.calls[0][0];
      expect(call.data.timestamp).toBeInstanceOf(Date);
    });

    it('should create a dead letter event on error', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'webhook', status: 'active',
      });
      mockPrisma.dataPoint.create.mockRejectedValue(new Error('DB error'));
      mockPrisma.deadLetterEvent.create.mockResolvedValue({ id: 'dle1' });
      await expect(service.ingestWebhook('ds1', { metrics: { x: 1 } })).rejects.toThrow('DB error');
      expect(mockPrisma.deadLetterEvent.create).toHaveBeenCalled();
    });
  });

  describe('ingestBatch', () => {
    it('should ingest multiple events', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'webhook', status: 'active',
      });
      mockPrisma.dataPoint.create.mockResolvedValue({ id: 'dp1' });
      const result = await service.ingestBatch('ds1', [
        { metrics: { a: 1 } },
        { metrics: { b: 2 } },
      ]);
      expect(result.ingested).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should throw if data source is not active', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'webhook', status: 'paused',
      });
      await expect(service.ingestBatch('ds1', [{ metrics: {} }])).rejects.toThrow(BadRequestException);
    });

    it('should handle partial failures', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds1', type: 'webhook', status: 'active',
      });
      mockPrisma.dataPoint.create
        .mockResolvedValueOnce({ id: 'dp1' })
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ id: 'dp3' });
      mockPrisma.deadLetterEvent.create.mockResolvedValue({ id: 'dle1' });
      const result = await service.ingestBatch('ds1', [
        { metrics: { a: 1 } },
        { metrics: { b: 2 } },
        { metrics: { c: 3 } },
      ]);
      expect(result.ingested).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('transform', () => {
    it('should rename a field', async () => {
      const result = await service.transform(
        { old_name: 'value' },
        [{ type: 'rename', config: { from: 'old_name', to: 'new_name' } }],
      );
      expect(result.new_name).toBe('value');
      expect(result.old_name).toBeUndefined();
    });

    it('should cast a field to number', async () => {
      const result = await service.transform(
        { count: '42' },
        [{ type: 'cast', config: { field: 'count', targetType: 'number' } }],
      );
      expect(result.count).toBe(42);
    });

    it('should cast a field to string', async () => {
      const result = await service.transform(
        { code: 123 },
        [{ type: 'cast', config: { field: 'code', targetType: 'string' } }],
      );
      expect(result.code).toBe('123');
    });

    it('should cast a field to boolean', async () => {
      const result = await service.transform(
        { active: 1 },
        [{ type: 'cast', config: { field: 'active', targetType: 'boolean' } }],
      );
      expect(result.active).toBe(true);
    });

    it('should filter eq - pass', async () => {
      const result = await service.transform(
        { status: 'active', value: 10 },
        [{ type: 'filter', config: { field: 'status', operator: 'eq', value: 'active' } }],
      );
      expect(result.value).toBe(10);
    });

    it('should filter eq - reject', async () => {
      const result = await service.transform(
        { status: 'inactive', value: 10 },
        [{ type: 'filter', config: { field: 'status', operator: 'eq', value: 'active' } }],
      );
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should filter neq - reject', async () => {
      const result = await service.transform(
        { status: 'active', value: 10 },
        [{ type: 'filter', config: { field: 'status', operator: 'neq', value: 'active' } }],
      );
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should filter gt - reject when value is not greater', async () => {
      const result = await service.transform(
        { amount: 5 },
        [{ type: 'filter', config: { field: 'amount', operator: 'gt', value: 10 } }],
      );
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should filter lt - reject when value is not less', async () => {
      const result = await service.transform(
        { amount: 15 },
        [{ type: 'filter', config: { field: 'amount', operator: 'lt', value: 10 } }],
      );
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should derive a field using addition', async () => {
      const result = await service.transform(
        { a: 10, b: 20 },
        [{ type: 'derive', config: { field: 'total', expression: 'a + b' } }],
      );
      expect(result.total).toBe(30);
    });

    it('should skip unknown step types', async () => {
      const result = await service.transform(
        { foo: 'bar' },
        [{ type: 'unknown', config: {} }],
      );
      expect(result.foo).toBe('bar');
    });

    it('should handle multiple transform steps', async () => {
      const result = await service.transform(
        { old: '42' },
        [
          { type: 'rename', config: { from: 'old', to: 'count' } },
          { type: 'cast', config: { field: 'count', targetType: 'number' } },
        ],
      );
      expect(result.count).toBe(42);
      expect(result.old).toBeUndefined();
    });
  });
});
