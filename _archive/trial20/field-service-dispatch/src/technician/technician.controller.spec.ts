import { Request } from 'express';
import { TechnicianController } from './technician.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  updatePosition: vi.fn(),
  remove: vi.fn(),
};

const makeReq = (companyId = 'c1') =>
  ({ companyId } as unknown as Request & { companyId: string });

describe('TechnicianController', () => {
  let controller: TechnicianController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TechnicianController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    const dto = { companyId: 'c1', name: 'John', email: 'j@e.com', skills: ['x'] };
    mockService.create.mockResolvedValue({ id: 't1', ...dto });

    expect(await controller.create(dto)).toEqual({ id: 't1', ...dto });
  });

  it('should call findAll with companyId from request', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    expect(await controller.findAll(makeReq())).toEqual([]);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: 't1' });

    expect(await controller.findOne('t1', makeReq())).toEqual({ id: 't1' });
    expect(mockService.findOne).toHaveBeenCalledWith('t1', 'c1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: 't1', name: 'Jane' });

    expect(await controller.update('t1', { name: 'Jane' } as any, makeReq())).toEqual({
      id: 't1',
      name: 'Jane',
    });
  });

  it('should call updatePosition', async () => {
    mockService.updatePosition.mockResolvedValue({ id: 't1' });

    expect(
      await controller.updatePosition('t1', { lat: 40.7, lng: -74.0 }, makeReq()),
    ).toEqual({ id: 't1' });
    expect(mockService.updatePosition).toHaveBeenCalledWith('t1', 'c1', 40.7, -74.0);
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: 't1' });

    expect(await controller.remove('t1', makeReq())).toEqual({ id: 't1' });
  });
});
