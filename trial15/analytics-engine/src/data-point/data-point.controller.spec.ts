import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { DataPointController } from './data-point.controller';
import { DataPointService } from './data-point.service';

const mockService = {
  create: vi.fn(),
  createBatch: vi.fn(),
  query: vi.fn(),
  getMetrics: vi.fn(),
};

function mockReq(tenantId?: string) {
  return { tenantId } as any;
}

describe('DataPointController', () => {
  let controller: DataPointController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new DataPointController(mockService as unknown as DataPointService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a data point', async () => {
      const dto = {
        metric: 'cpu',
        value: 80,
        timestamp: '2024-01-01T00:00:00Z',
        dataSourceId: 'ds-1',
      };
      mockService.create.mockResolvedValue({ id: 'dp-1', ...dto });

      const result = await controller.create(mockReq('tenant-1'), dto);

      expect(result.id).toBe('dp-1');
      expect(mockService.create).toHaveBeenCalledWith('tenant-1', dto);
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), {
          metric: 'cpu',
          value: 80,
          timestamp: '2024-01-01T00:00:00Z',
          dataSourceId: 'ds-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createBatch', () => {
    it('should create batch data points', async () => {
      const dtos = [
        { metric: 'm1', value: 1, timestamp: '2024-01-01T00:00:00Z', dataSourceId: 'ds-1' },
      ];
      mockService.createBatch.mockResolvedValue({ count: 1 });

      const result = await controller.createBatch(mockReq('tenant-1'), dtos);

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('query', () => {
    it('should query data points', async () => {
      mockService.query.mockResolvedValue([]);

      const result = await controller.query(mockReq('tenant-1'), { metric: 'cpu' });

      expect(result).toEqual([]);
      expect(mockService.query).toHaveBeenCalledWith('tenant-1', { metric: 'cpu' });
    });
  });

  describe('getMetrics', () => {
    it('should return metrics list', async () => {
      mockService.getMetrics.mockResolvedValue(['cpu', 'memory']);

      const result = await controller.getMetrics(mockReq('tenant-1'));

      expect(result).toEqual(['cpu', 'memory']);
    });
  });
});
