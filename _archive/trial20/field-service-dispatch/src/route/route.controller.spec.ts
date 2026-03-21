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
    const dto = { technicianId: 't1', date: '2024-01-15', waypoints: [] };
    mockService.create.mockResolvedValue({ id: 'r1' });

    expect(await controller.create(dto as any)).toEqual({ id: 'r1' });
  });

  it('should call findByTechnician', async () => {
    mockService.findByTechnician.mockResolvedValue([]);

    expect(await controller.findByTechnician('t1')).toEqual([]);
    expect(mockService.findByTechnician).toHaveBeenCalledWith('t1');
  });

  it('should call optimize', async () => {
    mockService.optimize.mockResolvedValue({ id: 'r1', optimizedOrder: [] });

    expect(await controller.optimize('r1')).toEqual({
      id: 'r1',
      optimizedOrder: [],
    });
  });
});
