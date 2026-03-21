import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { Reflector } from '@nestjs/core';

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
      providers: [
        { provide: WorkOrdersService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<WorkOrdersController>(WorkOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with companyId and dto', async () => {
    const dto = { customerId: 'c1', title: 'Fix AC' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create('comp-1', dto as any);
    expect(mockService.create).toHaveBeenCalledWith('comp-1', dto);
    expect(result.id).toBe('1');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll('comp-1');
    expect(mockService.findAll).toHaveBeenCalledWith('comp-1', undefined);
    expect(result).toEqual([]);
  });

  it('should call findAll with status filter', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll('comp-1', 'ASSIGNED' as any);
    expect(mockService.findAll).toHaveBeenCalledWith('comp-1', 'ASSIGNED');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('comp-1', '1');
    expect(result.id).toBe('1');
  });

  it('should call transitionStatus', async () => {
    mockService.transitionStatus.mockResolvedValue({ id: '1', status: 'EN_ROUTE' });
    const result = await controller.transitionStatus('comp-1', '1', {
      status: 'EN_ROUTE' as any,
      note: 'Going',
    });
    expect(mockService.transitionStatus).toHaveBeenCalledWith(
      'comp-1', '1', 'EN_ROUTE', 'Going',
    );
    expect(result.status).toBe('EN_ROUTE');
  });

  it('should call assignTechnician', async () => {
    mockService.assignTechnician.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
    const result = await controller.assignTechnician('comp-1', '1', 'tech-1');
    expect(mockService.assignTechnician).toHaveBeenCalledWith('comp-1', '1', 'tech-1');
  });

  it('should call autoAssign', async () => {
    mockService.autoAssign.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
    const result = await controller.autoAssign('comp-1', '1');
    expect(mockService.autoAssign).toHaveBeenCalledWith('comp-1', '1');
  });

  it('should call delete', async () => {
    mockService.delete.mockResolvedValue({ id: '1' });
    const result = await controller.delete('comp-1', '1');
    expect(mockService.delete).toHaveBeenCalledWith('comp-1', '1');
  });
});
