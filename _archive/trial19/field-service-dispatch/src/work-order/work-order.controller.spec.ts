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
  returnToAssigned: vi.fn(),
  autoAssign: vi.fn(),
};

const makeReq = (companyId = 'co-1') =>
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

  it('should call create', async () => {
    const dto = {
      companyId: 'co-1',
      customerId: 'cust-1',
      description: 'Fix sink',
    };
    mockService.create.mockResolvedValue({ id: 'wo-1', ...dto });

    const result = await controller.create(dto);
    expect(result.id).toBe('wo-1');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    const req = makeReq();

    await controller.findAll(req);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('co-1');
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: 'wo-1' });
    const req = makeReq();

    await controller.findOne('wo-1', req);
    expect(mockService.findOne).toHaveBeenCalledWith('wo-1', 'co-1');
  });

  it('should call assign with technicianId', async () => {
    mockService.assign.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED' });
    const req = makeReq();

    await controller.assign('wo-1', { technicianId: 'tech-1' }, req);
    expect(mockService.assign).toHaveBeenCalledWith('wo-1', 'co-1', 'tech-1');
  });

  it('should call unassign', async () => {
    mockService.unassign.mockResolvedValue({ id: 'wo-1', status: 'UNASSIGNED' });
    const req = makeReq();

    await controller.unassign('wo-1', req);
    expect(mockService.unassign).toHaveBeenCalledWith('wo-1', 'co-1');
  });

  it('should call enRoute', async () => {
    mockService.enRoute.mockResolvedValue({ id: 'wo-1', status: 'EN_ROUTE' });
    const req = makeReq();

    await controller.enRoute('wo-1', req);
    expect(mockService.enRoute).toHaveBeenCalledWith('wo-1', 'co-1');
  });

  it('should call onSite', async () => {
    mockService.onSite.mockResolvedValue({ id: 'wo-1', status: 'ON_SITE' });
    const req = makeReq();

    await controller.onSite('wo-1', req);
    expect(mockService.onSite).toHaveBeenCalledWith('wo-1', 'co-1');
  });

  it('should call start', async () => {
    mockService.start.mockResolvedValue({ id: 'wo-1', status: 'IN_PROGRESS' });
    const req = makeReq();

    await controller.start('wo-1', req);
    expect(mockService.start).toHaveBeenCalledWith('wo-1', 'co-1');
  });

  it('should call complete', async () => {
    mockService.complete.mockResolvedValue({ id: 'wo-1', status: 'COMPLETED' });
    const req = makeReq();

    await controller.complete('wo-1', req);
    expect(mockService.complete).toHaveBeenCalledWith('wo-1', 'co-1');
  });

  it('should call returnToAssigned', async () => {
    mockService.returnToAssigned.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED' });
    const req = makeReq();

    await controller.returnToAssigned('wo-1', req);
    expect(mockService.returnToAssigned).toHaveBeenCalledWith('wo-1', 'co-1');
  });

  it('should call autoAssign', async () => {
    mockService.autoAssign.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED', technicianId: 'tech-1' });
    const req = makeReq();

    await controller.autoAssign('wo-1', req);
    expect(mockService.autoAssign).toHaveBeenCalledWith('wo-1', 'co-1');
  });
});
