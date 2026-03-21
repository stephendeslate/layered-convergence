import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

const mockDashboardService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockRequest = { tenantId: 'tenant-1' };

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const dto = { name: 'Sales' };
      const expected = { id: '1', ...dto };
      mockDashboardService.create.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.create(mockRequest as any, dto);

      expect(result).toEqual(expected);
      expect(mockDashboardService.create).toHaveBeenCalledWith('tenant-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return dashboards', async () => {
      const expected = [{ id: '1', name: 'Sales' }];
      mockDashboardService.findAll.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.findAll(mockRequest as any);

      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('should return a dashboard', async () => {
      const expected = { id: '1', name: 'Sales' };
      mockDashboardService.findById.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.findById(mockRequest as any, '1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: '1', ...dto };
      mockDashboardService.update.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.update(mockRequest as any, '1', dto);

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockDashboardService.remove.mockResolvedValue({ id: '1' });

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.remove(mockRequest as any, '1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
