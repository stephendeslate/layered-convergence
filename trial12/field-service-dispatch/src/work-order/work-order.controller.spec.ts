import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { WorkOrderController } from './work-order.controller.js';
import { WorkOrderService } from './work-order.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  transition: vi.fn(),
  autoAssign: vi.fn(),
  getHistory: vi.fn(),
};

describe('WorkOrderController', () => {
  let controller: WorkOrderController;
  const mockReq = { companyId: 'company-1' } as any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [WorkOrderController],
      providers: [{ provide: WorkOrderService, useValue: mockService }],
    }).compile();

    controller = module.get<WorkOrderController>(WorkOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a work order', async () => {
    const dto = { customerId: 'cust-1', description: 'Fix sink' };
    const expected = { id: 'wo-1', ...dto };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
  });

  it('should find all work orders', async () => {
    const expected = [{ id: 'wo-1' }];
    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(mockReq);
    expect(result).toEqual(expected);
  });

  it('should find one work order', async () => {
    const expected = { id: 'wo-1' };
    mockService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne(mockReq, 'wo-1');
    expect(result).toEqual(expected);
  });

  it('should transition a work order', async () => {
    const dto = { status: 'ASSIGNED' as any };
    const expected = { id: 'wo-1', status: 'ASSIGNED' };
    mockService.transition.mockResolvedValue(expected);

    const result = await controller.transition(mockReq, 'wo-1', dto);
    expect(result).toEqual(expected);
  });

  it('should auto-assign with skills', async () => {
    const expected = { id: 'wo-1', status: 'ASSIGNED' };
    mockService.autoAssign.mockResolvedValue(expected);

    const result = await controller.autoAssign(mockReq, 'wo-1', 'plumbing,electrical');
    expect(result).toEqual(expected);
    expect(mockService.autoAssign).toHaveBeenCalledWith('company-1', 'wo-1', ['plumbing', 'electrical']);
  });

  it('should get work order history', async () => {
    const expected = [{ fromStatus: 'UNASSIGNED', toStatus: 'ASSIGNED' }];
    mockService.getHistory.mockResolvedValue(expected);

    const result = await controller.getHistory(mockReq, 'wo-1');
    expect(result).toEqual(expected);
  });
});
