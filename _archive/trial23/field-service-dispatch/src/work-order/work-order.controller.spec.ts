import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderController } from './work-order.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  transition: vi.fn(),
  assign: vi.fn(),
  unassign: vi.fn(),
  enRoute: vi.fn(),
  onSite: vi.fn(),
  start: vi.fn(),
  complete: vi.fn(),
  returnToAssigned: vi.fn(),
  autoAssign: vi.fn(),
};

const mockReq = (companyId: string) => ({ headers: { 'x-company-id': companyId }, companyId } as any);

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
    const dto = { companyId: 'c1', customerId: 'cust1', description: 'Fix' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto as any);
    expect(result.id).toBe('1');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    await controller.findAll(mockReq('c1'));
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    await controller.findOne('1', mockReq('c1'));
    expect(mockService.findOne).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call assign', async () => {
    mockService.assign.mockResolvedValue({ id: '1' });
    await controller.assign('1', { technicianId: 't1' } as any, mockReq('c1'));
    expect(mockService.assign).toHaveBeenCalledWith('1', 'c1', 't1');
  });

  it('should call transition', async () => {
    mockService.transition.mockResolvedValue({ id: '1' });
    await controller.transition('1', { status: 'EN_ROUTE' } as any, mockReq('c1'));
    expect(mockService.transition).toHaveBeenCalledWith('1', 'c1', 'EN_ROUTE', expect.any(Object));
  });

  it('should call unassign', async () => {
    mockService.unassign.mockResolvedValue({ id: '1' });
    await controller.unassign('1', mockReq('c1'));
    expect(mockService.unassign).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call enRoute', async () => {
    mockService.enRoute.mockResolvedValue({ id: '1' });
    await controller.enRoute('1', mockReq('c1'));
    expect(mockService.enRoute).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call onSite', async () => {
    mockService.onSite.mockResolvedValue({ id: '1' });
    await controller.onSite('1', mockReq('c1'));
    expect(mockService.onSite).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call start', async () => {
    mockService.start.mockResolvedValue({ id: '1' });
    await controller.start('1', mockReq('c1'));
    expect(mockService.start).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call complete', async () => {
    mockService.complete.mockResolvedValue({ id: '1' });
    await controller.complete('1', mockReq('c1'));
    expect(mockService.complete).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call returnToAssigned', async () => {
    mockService.returnToAssigned.mockResolvedValue({ id: '1' });
    await controller.returnToAssigned('1', mockReq('c1'));
    expect(mockService.returnToAssigned).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call autoAssign', async () => {
    mockService.autoAssign.mockResolvedValue({ id: '1' });
    await controller.autoAssign('1', mockReq('c1'));
    expect(mockService.autoAssign).toHaveBeenCalledWith('1', 'c1');
  });
});
