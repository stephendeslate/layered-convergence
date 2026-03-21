import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TechnicianController } from './technician.controller.js';
import { TechnicianService } from './technician.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  updateGps: vi.fn(),
  remove: vi.fn(),
};

describe('TechnicianController', () => {
  let controller: TechnicianController;
  const mockReq = { companyId: 'company-1' } as any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [TechnicianController],
      providers: [{ provide: TechnicianService, useValue: mockService }],
    }).compile();

    controller = module.get<TechnicianController>(TechnicianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a technician', async () => {
    const dto = { name: 'John', email: 'john@test.com', skills: ['plumbing'] };
    const expected = { id: '1', ...dto };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
  });

  it('should find all technicians', async () => {
    const expected = [{ id: '1', name: 'John' }];
    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(mockReq);
    expect(result).toEqual(expected);
  });

  it('should find one technician', async () => {
    const expected = { id: '1', name: 'John' };
    mockService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne(mockReq, '1');
    expect(result).toEqual(expected);
  });

  it('should update a technician', async () => {
    const dto = { name: 'Jane' };
    mockService.update.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.update(mockReq, '1', dto);
    expect(result).toEqual({ id: '1', ...dto });
  });

  it('should update GPS position', async () => {
    const dto = { lat: 40.7128, lng: -74.006 };
    mockService.updateGps.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.updateGps(mockReq, '1', dto);
    expect(result).toEqual({ id: '1', ...dto });
  });

  it('should remove a technician', async () => {
    mockService.remove.mockResolvedValue({ count: 1 });

    const result = await controller.remove(mockReq, '1');
    expect(result).toEqual({ count: 1 });
  });
});
