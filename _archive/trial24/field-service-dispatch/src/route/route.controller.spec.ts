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

  it('should call create on service', async () => {
    const dto = { technicianId: 't1', date: '2024-01-01', waypoints: [] };
    mockService.create.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.create(dto);
    expect(result.id).toBe('1');
  });

  it('should call findByTechnician', async () => {
    mockService.findByTechnician.mockResolvedValue([]);

    const result = await controller.findByTechnician('t1');
    expect(Array.isArray(result)).toBe(true);
  });

  it('should call optimize', async () => {
    mockService.optimize.mockResolvedValue({ id: '1', optimizedOrder: [] });

    const result = await controller.optimize('1');
    expect(result.id).toBe('1');
  });
});
