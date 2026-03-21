import { Request } from 'express';
import { WorkOrderController } from './work-order.controller.js';

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

const makeReq = (companyId = 'c1') =>
  ({ companyId } as unknown as Request & { companyId: string });

describe('WorkOrderController', () => {
  let controller: WorkOrderController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new WorkOrderController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix' };
    mockService.create.mockResolvedValue({ id: 'wo1' });

    expect(await controller.create(dto as any)).toEqual({ id: 'wo1' });
  });

  it('should call findAll', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    expect(await controller.findAll(makeReq())).toEqual([]);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: 'wo1' });

    expect(await controller.findOne('wo1', makeReq())).toEqual({ id: 'wo1' });
  });

  it('should call assign', async () => {
    mockService.assign.mockResolvedValue({ id: 'wo1' });

    expect(
      await controller.assign('wo1', { technicianId: 't1' }, makeReq()),
    ).toEqual({ id: 'wo1' });
    expect(mockService.assign).toHaveBeenCalledWith('wo1', 'c1', 't1');
  });

  it('should call unassign', async () => {
    mockService.unassign.mockResolvedValue({ id: 'wo1' });

    expect(await controller.unassign('wo1', makeReq())).toEqual({ id: 'wo1' });
  });

  it('should call enRoute', async () => {
    mockService.enRoute.mockResolvedValue({ id: 'wo1' });

    expect(await controller.enRoute('wo1', makeReq())).toEqual({ id: 'wo1' });
  });

  it('should call onSite', async () => {
    mockService.onSite.mockResolvedValue({ id: 'wo1' });

    expect(await controller.onSite('wo1', makeReq())).toEqual({ id: 'wo1' });
  });

  it('should call start', async () => {
    mockService.start.mockResolvedValue({ id: 'wo1' });

    expect(await controller.start('wo1', makeReq())).toEqual({ id: 'wo1' });
  });

  it('should call complete', async () => {
    mockService.complete.mockResolvedValue({ id: 'wo1' });

    expect(await controller.complete('wo1', makeReq())).toEqual({ id: 'wo1' });
  });

  it('should call returnToAssigned', async () => {
    mockService.returnToAssigned.mockResolvedValue({ id: 'wo1' });

    expect(await controller.returnToAssigned('wo1', makeReq())).toEqual({
      id: 'wo1',
    });
  });

  it('should call autoAssign', async () => {
    mockService.autoAssign.mockResolvedValue({ id: 'wo1' });

    expect(await controller.autoAssign('wo1', makeReq())).toEqual({ id: 'wo1' });
  });
});
