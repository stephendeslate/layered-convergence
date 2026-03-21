import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointController } from './data-point.controller';

describe('DataPointController', () => {
  let controller: DataPointController;
  let mockService: any;

  const mockReq = { tenantId: 'tenant-1' } as any;

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: 'dp-1' }),
      query: vi.fn().mockResolvedValue([]),
    };
    controller = new DataPointController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a data point', async () => {
    const dto = { dataSourceId: 'ds-1', timestamp: '2024-01-01T00:00:00Z' };
    await controller.create(mockReq, dto);
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should query data points without date filters', async () => {
    await controller.query(mockReq, 'ds-1');
    expect(mockService.query).toHaveBeenCalledWith('tenant-1', 'ds-1', undefined, undefined);
  });

  it('should query data points with date filters', async () => {
    await controller.query(mockReq, 'ds-1', '2024-01-01', '2024-12-31');
    expect(mockService.query).toHaveBeenCalledWith('tenant-1', 'ds-1', '2024-01-01', '2024-12-31');
  });

  it('should pass tenant id from request', async () => {
    const otherReq = { tenantId: 'tenant-2' } as any;
    await controller.query(otherReq, 'ds-1');
    expect(mockService.query).toHaveBeenCalledWith('tenant-2', 'ds-1', undefined, undefined);
  });
});
