import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { WorkOrderController } from './work-order.controller.js';
import { WorkOrderService } from './work-order.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  transition: vi.fn(),
  assign: vi.fn(),
  autoAssign: vi.fn(),
};

describe('WorkOrderController', () => {
  let controller: WorkOrderController;
  const companyId = 'company-1';

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

  describe('create', () => {
    it('should call service.create with companyId and dto', async () => {
      const dto = { customerId: 'cust-1', description: 'Fix sink' };
      const req = { companyId } as any;
      mockService.create.mockResolvedValue({ id: 'wo-1' });

      await controller.create(req, dto as any);
      expect(mockService.create).toHaveBeenCalledWith(companyId, dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with companyId', async () => {
      const req = { companyId } as any;
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(req);
      expect(mockService.findAll).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with companyId and id', async () => {
      const req = { companyId } as any;
      mockService.findOne.mockResolvedValue({ id: 'wo-1' });

      await controller.findOne(req, 'wo-1');
      expect(mockService.findOne).toHaveBeenCalledWith(companyId, 'wo-1');
    });
  });

  describe('assign', () => {
    it('should call service.assign with companyId, id, and technicianId', async () => {
      const req = { companyId } as any;
      mockService.assign.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED' });

      await controller.assign(req, 'wo-1', { technicianId: 'tech-1' } as any);
      expect(mockService.assign).toHaveBeenCalledWith(companyId, 'wo-1', 'tech-1');
    });
  });

  describe('transition', () => {
    it('should call service.transition with companyId, id, and dto', async () => {
      const req = { companyId } as any;
      const dto = { status: 'EN_ROUTE' };
      mockService.transition.mockResolvedValue({ id: 'wo-1', status: 'EN_ROUTE' });

      await controller.transition(req, 'wo-1', dto as any);
      expect(mockService.transition).toHaveBeenCalledWith(companyId, 'wo-1', dto);
    });
  });

  describe('autoAssign', () => {
    it('should call service.autoAssign with companyId and id', async () => {
      const req = { companyId } as any;
      mockService.autoAssign.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED' });

      await controller.autoAssign(req, 'wo-1');
      expect(mockService.autoAssign).toHaveBeenCalledWith(companyId, 'wo-1');
    });
  });
});
