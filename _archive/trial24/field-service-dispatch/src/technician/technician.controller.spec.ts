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

const mockReq = (companyId = 'c1') => ({ companyId, headers: { 'x-company-id': companyId } }) as any;

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
    const dto = { companyId: 'c1', name: 'Tech', email: 't@test.com', skills: ['x'] };
    mockService.create.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.create(dto);
    expect(result.name).toBe('Tech');
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

  it('should call update with correct args', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'U' });

    const result = await controller.update('1', { name: 'U' }, mockReq());
    expect(result.name).toBe('U');
  });

  it('should call updatePosition', async () => {
    mockService.updatePosition.mockResolvedValue({ id: '1', currentLat: 40.7 });

    const result = await controller.updatePosition('1', { lat: 40.7, lng: -74.0 }, mockReq());
    expect(result.currentLat).toBe(40.7);
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });

    const result = await controller.remove('1', mockReq());
    expect(result.id).toBe('1');
  });
});
