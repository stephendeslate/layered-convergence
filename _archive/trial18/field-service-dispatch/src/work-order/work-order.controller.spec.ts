import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderController } from './work-order.controller.js';
import { WorkOrderService } from './work-order.service.js';
import { Request } from 'express';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  assign: vi.fn(),
  unassign: vi.fn(),
  enRoute: vi.fn(),
  onSite: vi.fn(),
  start: vi.fn(),
  complete: vi.fn(),
  reassign: vi.fn(),
  autoAssign: vi.fn(),
};

const mockReq = (companyId: string) =>
  ({ companyId } as unknown as Request & { companyId: string });

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

  it('should call create on service', async () => {
    const dto = { companyId: 'co-1', customerId: 'cust-1', description: 'Fix sink' };
    mockService.create.mockResolvedValue({ id: 'wo-1', ...dto });

    const result = await controller.create(dto);
    expect(result.id).toBe('wo-1');
  });

  it('should call findAll on service', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    const result = await controller.findAll(mockReq('co-1'));
    expect(result).toEqual([]);
  });

  it('should call findOne on service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'wo-1' });

    const result = await controller.findOne('wo-1', mockReq('co-1'));
    expect(result.id).toBe('wo-1');
  });

  it('should call assign on service', async () => {
    mockService.assign.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED' });

    const result = await controller.assign('wo-1', { technicianId: 'tech-1' }, mockReq('co-1'));
    expect(result.status).toBe('ASSIGNED');
  });

  it('should call unassign on service', async () => {
    mockService.unassign.mockResolvedValue({ id: 'wo-1', status: 'UNASSIGNED' });

    const result = await controller.unassign('wo-1', mockReq('co-1'));
    expect(result.status).toBe('UNASSIGNED');
  });

  it('should call enRoute on service', async () => {
    mockService.enRoute.mockResolvedValue({ id: 'wo-1', status: 'EN_ROUTE' });

    const result = await controller.enRoute('wo-1', mockReq('co-1'));
    expect(result.status).toBe('EN_ROUTE');
  });

  it('should call complete on service', async () => {
    mockService.complete.mockResolvedValue({ id: 'wo-1', status: 'COMPLETED' });

    const result = await controller.complete('wo-1', mockReq('co-1'));
    expect(result.status).toBe('COMPLETED');
  });

  it('should call autoAssign on service', async () => {
    mockService.autoAssign.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' });

    const result = await controller.autoAssign('wo-1', mockReq('co-1'));
    expect(result.technicianId).toBe('tech-1');
  });
});
