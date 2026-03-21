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

function mockReq(companyId = 'c1') {
  return { headers: { 'x-company-id': companyId }, companyId } as any;
}

describe('TechnicianController', () => {
  let controller: TechnicianController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TechnicianController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with dto', async () => {
    const dto = { companyId: 'c1', name: 'Bob', email: 'bob@t.com', skills: [] };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto as any);
    expect(result.name).toBe('Bob');
  });

  it('should call findAll with companyId from request', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    const result = await controller.findAll(mockReq());
    expect(Array.isArray(result)).toBe(true);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('c1');
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1', mockReq());
    expect(result.id).toBe('1');
  });

  it('should call update with id, dto, and companyId', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' } as any, mockReq());
    expect(result.name).toBe('Updated');
  });

  it('should call updatePosition with lat and lng', async () => {
    mockService.updatePosition.mockResolvedValue({ id: '1', currentLat: 40.7 });
    const result = await controller.updatePosition('1', { lat: 40.7, lng: -74.0 } as any, mockReq());
    expect(result.currentLat).toBe(40.7);
  });

  it('should call remove with id and companyId', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1', mockReq());
    expect(result.id).toBe('1');
  });
});
