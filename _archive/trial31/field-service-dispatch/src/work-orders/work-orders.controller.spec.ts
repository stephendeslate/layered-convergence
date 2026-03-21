import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  transitionStatus: vi.fn(),
  autoAssign: vi.fn(),
  delete: vi.fn(),
};

describe('WorkOrdersController', () => {
  let controller: WorkOrdersController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WorkOrdersController],
      providers: [{ provide: WorkOrdersService, useValue: mockService }],
    }).compile();

    controller = module.get(WorkOrdersController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with companyId', async () => {
    const dto = { customerId: 'c1', title: 'Test' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create('comp-1', dto);
    expect(mockService.create).toHaveBeenCalledWith('comp-1', dto);
    expect(result.id).toBe('1');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll('comp-1');
    expect(mockService.findAll).toHaveBeenCalledWith('comp-1');
  });

  it('should call findOne with companyId and id', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    await controller.findOne('comp-1', '1');
    expect(mockService.findOne).toHaveBeenCalledWith('comp-1', '1');
  });

  it('should call transitionStatus', async () => {
    const dto = { status: 'ASSIGNED' as const };
    mockService.transitionStatus.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
    await controller.transitionStatus('comp-1', '1', dto);
    expect(mockService.transitionStatus).toHaveBeenCalledWith('comp-1', '1', dto);
  });

  it('should call autoAssign', async () => {
    mockService.autoAssign.mockResolvedValue({ id: '1' });
    await controller.autoAssign('comp-1', '1');
    expect(mockService.autoAssign).toHaveBeenCalledWith('comp-1', '1');
  });

  it('should call delete', async () => {
    mockService.delete.mockResolvedValue({ id: '1' });
    await controller.delete('comp-1', '1');
    expect(mockService.delete).toHaveBeenCalledWith('comp-1', '1');
  });
});
