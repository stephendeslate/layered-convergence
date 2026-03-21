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

  it('should call create', async () => {
    const dto = { technicianId: 't1', date: '2024-01-15', waypoints: [], estimatedDuration: 60 };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto as any);
    expect(result.id).toBe('1');
  });

  it('should call findByTechnician', async () => {
    mockService.findByTechnician.mockResolvedValue([]);
    await controller.findByTechnician('t1');
    expect(mockService.findByTechnician).toHaveBeenCalledWith('t1');
  });

  it('should call optimize', async () => {
    mockService.optimize.mockResolvedValue({ id: '1' });
    await controller.optimize('1');
    expect(mockService.optimize).toHaveBeenCalledWith('1');
  });
});
