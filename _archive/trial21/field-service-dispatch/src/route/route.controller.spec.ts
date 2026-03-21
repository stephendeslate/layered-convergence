import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteController } from './route.controller.js';

const mockService = {
  create: vi.fn(),
  findByTechnician: vi.fn(),
  optimize: vi.fn(),
};

describe('RouteController', () => {
  let controller: RouteController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new RouteController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with dto', async () => {
    const dto = { technicianId: 't1', date: '2024-01-01', waypoints: [] };
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create(dto as any);
    expect(result.id).toBe('1');
  });

  it('should call findByTechnician with technicianId', async () => {
    mockService.findByTechnician.mockResolvedValue([]);
    const result = await controller.findByTechnician('t1');
    expect(Array.isArray(result)).toBe(true);
  });

  it('should call optimize with id', async () => {
    mockService.optimize.mockResolvedValue({ id: '1', optimizedOrder: [] });
    const result = await controller.optimize('1');
    expect(result.optimizedOrder).toBeDefined();
  });
});
