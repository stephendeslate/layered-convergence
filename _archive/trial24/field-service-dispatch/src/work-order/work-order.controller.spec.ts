import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderController } from './work-order.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  assign: vi.fn(),
  transition: vi.fn(),
  unassign: vi.fn(),
  enRoute: vi.fn(),
  onSite: vi.fn(),
  start: vi.fn(),
  complete: vi.fn(),
  returnToAssigned: vi.fn(),
  autoAssign: vi.fn(),
};

const mockReq = (companyId = 'c1') => ({ companyId, headers: { 'x-company-id': companyId } }) as any;

describe('WorkOrderController', () => {
  let controller: WorkOrderController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new WorkOrderController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.create(dto);
    expect(result.companyId).toBe('c1');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    const result = await controller.findAll(mockReq());
    expect(Array.isArray(result)).toBe(true);
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1', mockReq());
    expect(result.id).toBe('1');
  });

  it('should call assign with correct args', async () => {
    mockService.assign.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

    const result = await controller.assign('1', { technicianId: 't1' }, mockReq());
    expect(result.status).toBe('ASSIGNED');
  });

  it('should call transition with correct args', async () => {
    mockService.transition.mockResolvedValue({ id: '1', status: 'EN_ROUTE' });

    const result = await controller.transition('1', { status: 'EN_ROUTE' }, mockReq());
    expect(result.status).toBe('EN_ROUTE');
  });

  it('should call unassign', async () => {
    mockService.unassign.mockResolvedValue({ id: '1', status: 'UNASSIGNED' });

    const result = await controller.unassign('1', mockReq());
    expect(result.status).toBe('UNASSIGNED');
  });

  it('should call enRoute', async () => {
    mockService.enRoute.mockResolvedValue({ id: '1', status: 'EN_ROUTE' });

    const result = await controller.enRoute('1', mockReq());
    expect(result.status).toBe('EN_ROUTE');
  });

  it('should call onSite', async () => {
    mockService.onSite.mockResolvedValue({ id: '1', status: 'ON_SITE' });

    const result = await controller.onSite('1', mockReq());
    expect(result.status).toBe('ON_SITE');
  });

  it('should call start', async () => {
    mockService.start.mockResolvedValue({ id: '1', status: 'IN_PROGRESS' });

    const result = await controller.start('1', mockReq());
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('should call complete', async () => {
    mockService.complete.mockResolvedValue({ id: '1', status: 'COMPLETED' });

    const result = await controller.complete('1', mockReq());
    expect(result.status).toBe('COMPLETED');
  });

  it('should call returnToAssigned', async () => {
    mockService.returnToAssigned.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

    const result = await controller.returnToAssigned('1', mockReq());
    expect(result.status).toBe('ASSIGNED');
  });

  it('should call autoAssign', async () => {
    mockService.autoAssign.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

    const result = await controller.autoAssign('1', mockReq());
    expect(result.status).toBe('ASSIGNED');
  });
});
