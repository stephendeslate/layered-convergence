import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointController } from './data-point.controller';

describe('DataPointController', () => {
  let controller: DataPointController;
  let mockService: any;

  const mockReq = { tenantId: 'tenant-1' } as any;
  const mockPoint = { id: 'dp-1', tenantId: 'tenant-1', dataSourceId: 'ds-1' };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockPoint),
      query: vi.fn().mockResolvedValue([mockPoint]),
    };
    controller = new DataPointController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a data point', async () => {
    const result = await controller.create(mockReq, {
      dataSourceId: 'ds-1',
      timestamp: '2024-01-15T00:00:00Z',
    });
    expect(result).toEqual(mockPoint);
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', expect.any(Object));
  });

  it('should query data points', async () => {
    const result = await controller.query(mockReq, 'ds-1', '2024-01-01', '2024-12-31');
    expect(result).toHaveLength(1);
    expect(mockService.query).toHaveBeenCalledWith('tenant-1', 'ds-1', '2024-01-01', '2024-12-31');
  });

  it('should query data points without date filters', async () => {
    const result = await controller.query(mockReq, 'ds-1');
    expect(result).toHaveLength(1);
    expect(mockService.query).toHaveBeenCalledWith('tenant-1', 'ds-1', undefined, undefined);
  });
});
