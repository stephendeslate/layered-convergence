import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get(DashboardController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with tenantId from request', async () => {
    const req = { tenantId: 't1' } as any;
    const dto = { name: 'Sales', layout: {} };
    mockService.create.mockResolvedValue({ id: 'd1', ...dto });

    await controller.create(req, dto);
    expect(mockService.create).toHaveBeenCalledWith('t1', dto);
  });

  it('should call findAll with tenantId from request', async () => {
    const req = { tenantId: 't1' } as any;
    mockService.findAll.mockResolvedValue([]);

    await controller.findAll(req);
    expect(mockService.findAll).toHaveBeenCalledWith('t1');
  });

  it('should call findOne with tenantId and id', async () => {
    const req = { tenantId: 't1' } as any;
    mockService.findOne.mockResolvedValue({ id: 'd1' });

    await controller.findOne(req, 'd1');
    expect(mockService.findOne).toHaveBeenCalledWith('t1', 'd1');
  });

  it('should call update with tenantId, id, and dto', async () => {
    const req = { tenantId: 't1' } as any;
    mockService.update.mockResolvedValue({ id: 'd1', name: 'Updated' });

    await controller.update(req, 'd1', { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith('t1', 'd1', {
      name: 'Updated',
    });
  });

  it('should call remove with tenantId and id', async () => {
    const req = { tenantId: 't1' } as any;
    mockService.remove.mockResolvedValue({ id: 'd1' });

    await controller.remove(req, 'd1');
    expect(mockService.remove).toHaveBeenCalledWith('t1', 'd1');
  });
});
