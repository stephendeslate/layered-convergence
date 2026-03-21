import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  transitionStatus: vi.fn(),
  assignTechnician: vi.fn(),
  autoAssign: vi.fn(),
  delete: vi.fn(),
};

describe('WorkOrdersController', () => {
  let controller: WorkOrdersController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOrdersController],
      providers: [{ provide: WorkOrdersService, useValue: mockService }],
    }).compile();
    controller = module.get<WorkOrdersController>(WorkOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with companyId and dto', async () => {
    const dto = { title: 'Fix AC', description: 'AC broken', customerId: 'c1' } as any;
    mockService.create.mockResolvedValue({ id: 'wo1' });
    const result = await controller.create('comp1', dto);
    expect(mockService.create).toHaveBeenCalledWith('comp1', dto);
    expect(result.id).toBe('wo1');
  });

  it('should call findAll with companyId and optional status', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll('comp1', WorkOrderStatus.ASSIGNED);
    expect(mockService.findAll).toHaveBeenCalledWith('comp1', WorkOrderStatus.ASSIGNED);
  });

  it('should call findOne with companyId and id', async () => {
    mockService.findOne.mockResolvedValue({ id: 'wo1' });
    const result = await controller.findOne('comp1', 'wo1');
    expect(result.id).toBe('wo1');
  });

  it('should call transitionStatus with correct params', async () => {
    mockService.transitionStatus.mockResolvedValue({ id: 'wo1', status: 'ASSIGNED' });
    await controller.transitionStatus('comp1', 'wo1', { status: WorkOrderStatus.ASSIGNED } as any);
    expect(mockService.transitionStatus).toHaveBeenCalledWith('comp1', 'wo1', WorkOrderStatus.ASSIGNED, undefined);
  });

  it('should call assignTechnician', async () => {
    mockService.assignTechnician.mockResolvedValue({ id: 'wo1' });
    await controller.assignTechnician('comp1', 'wo1', 't1');
    expect(mockService.assignTechnician).toHaveBeenCalledWith('comp1', 'wo1', 't1');
  });

  it('should call autoAssign', async () => {
    mockService.autoAssign.mockResolvedValue({ id: 'wo1' });
    await controller.autoAssign('comp1', 'wo1');
    expect(mockService.autoAssign).toHaveBeenCalledWith('comp1', 'wo1');
  });

  it('should call delete', async () => {
    mockService.delete.mockResolvedValue({ id: 'wo1' });
    await controller.delete('comp1', 'wo1');
    expect(mockService.delete).toHaveBeenCalledWith('comp1', 'wo1');
  });
});
