import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianController } from './technician.controller.js';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  updatePosition: vi.fn(),
  remove: vi.fn(),
};

const mockReq = (companyId: string) => ({ headers: { 'x-company-id': companyId }, companyId } as any);

describe('TechnicianController', () => {
  let controller: TechnicianController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TechnicianController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const dto = { companyId: 'c1', name: 'Bob', email: 'b@t.com', skills: [] };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto as any);
    expect(result.name).toBe('Bob');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([{ id: '1' }]);
    const result = await controller.findAll(mockReq('c1'));
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
    expect(result).toHaveLength(1);
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    await controller.findOne('1', mockReq('c1'));
    expect(mockService.findOne).toHaveBeenCalledWith('1', 'c1');
  });

  it('should call update with id, companyId, and dto', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'New' });
    await controller.update('1', { name: 'New' } as any, mockReq('c1'));
    expect(mockService.update).toHaveBeenCalledWith('1', 'c1', { name: 'New' });
  });

  it('should call updatePosition', async () => {
    mockService.updatePosition.mockResolvedValue({ id: '1' });
    await controller.updatePosition('1', { lat: 40.7, lng: -74.0 }, mockReq('c1'));
    expect(mockService.updatePosition).toHaveBeenCalledWith('1', 'c1', 40.7, -74.0);
  });

  it('should call remove with id and companyId', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    await controller.remove('1', mockReq('c1'));
    expect(mockService.remove).toHaveBeenCalledWith('1', 'c1');
  });
});
