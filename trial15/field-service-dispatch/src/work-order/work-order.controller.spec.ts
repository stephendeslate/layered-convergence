import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderController } from './work-order.controller';
import { WorkOrderService } from './work-order.service';
import { CompanyRequest } from '../common/middleware/company-context.middleware';
import { WorkOrderStatus } from '@prisma/client';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  assign: vi.fn(),
  transition: vi.fn(),
  findByTechnician: vi.fn(),
  findByStatus: vi.fn(),
  getValidTransitions: vi.fn(),
};

const mockReq = { companyId: 'company-1' } as CompanyRequest;

describe('WorkOrderController', () => {
  let controller: WorkOrderController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOrderController],
      providers: [{ provide: WorkOrderService, useValue: mockService }],
    }).compile();

    controller = module.get<WorkOrderController>(WorkOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a work order', async () => {
      const dto = { title: 'Fix pipe', customerId: 'cust-1' };
      mockService.create.mockResolvedValue({ id: 'wo-1', ...dto, status: 'CREATED' });

      const result = await controller.create(mockReq, dto);
      expect(result.id).toBe('wo-1');
      expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return all work orders', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'wo-1' }]);
      const result = await controller.findAll(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should filter by status when provided', async () => {
      mockService.findByStatus.mockResolvedValue([{ id: 'wo-1', status: 'CREATED' }]);
      const result = await controller.findAll(mockReq, WorkOrderStatus.CREATED);
      expect(mockService.findByStatus).toHaveBeenCalledWith(WorkOrderStatus.CREATED, 'company-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a work order by id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'wo-1' });
      const result = await controller.findOne(mockReq, 'wo-1');
      expect(result.id).toBe('wo-1');
    });
  });

  describe('assign', () => {
    it('should assign a technician', async () => {
      mockService.assign.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' });
      const result = await controller.assign(mockReq, 'wo-1', { technicianId: 'tech-1' });
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('transition', () => {
    it('should transition a work order', async () => {
      mockService.transition.mockResolvedValue({ id: 'wo-1', status: 'EN_ROUTE' });
      const result = await controller.transition(mockReq, 'wo-1', { status: WorkOrderStatus.EN_ROUTE });
      expect(result.status).toBe('EN_ROUTE');
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions', async () => {
      mockService.findOne.mockResolvedValue({ id: 'wo-1', status: WorkOrderStatus.CREATED });
      mockService.getValidTransitions.mockReturnValue([WorkOrderStatus.ASSIGNED]);

      const result = await controller.getValidTransitions(mockReq, 'wo-1');
      expect(result.currentStatus).toBe(WorkOrderStatus.CREATED);
      expect(result.validTransitions).toContain(WorkOrderStatus.ASSIGNED);
    });
  });

  describe('findByTechnician', () => {
    it('should return work orders for a technician', async () => {
      mockService.findByTechnician.mockResolvedValue([{ id: 'wo-1' }]);
      const result = await controller.findByTechnician(mockReq, 'tech-1');
      expect(result).toHaveLength(1);
    });
  });
});
