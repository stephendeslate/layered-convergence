import { Test, TestingModule } from '@nestjs/testing';
import { TechnicianController } from './technician.controller.js';
import { TechnicianService } from './technician.service.js';
import { Request } from 'express';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  updatePosition: vi.fn(),
  remove: vi.fn(),
};

const mockReq = (companyId: string) =>
  ({ companyId } as unknown as Request & { companyId: string });

describe('TechnicianController', () => {
  let controller: TechnicianController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnicianController],
      providers: [{ provide: TechnicianService, useValue: mockService }],
    }).compile();

    controller = module.get<TechnicianController>(TechnicianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const dto = { companyId: 'co-1', name: 'John', email: 'j@t.com', skills: ['hvac'] };
    mockService.create.mockResolvedValue({ id: 'tech-1', ...dto });

    const result = await controller.create(dto);
    expect(result.id).toBe('tech-1');
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll on service with companyId from request', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);

    const result = await controller.findAll(mockReq('co-1'));
    expect(result).toEqual([]);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('co-1');
  });

  it('should call findOne on service', async () => {
    const expected = { id: 'tech-1', companyId: 'co-1' };
    mockService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('tech-1', mockReq('co-1'));
    expect(result).toEqual(expected);
  });

  it('should call update on service', async () => {
    const dto = { name: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'tech-1', ...dto });

    const result = await controller.update('tech-1', dto, mockReq('co-1'));
    expect(result.name).toBe('Updated');
  });

  it('should call updatePosition on service', async () => {
    const dto = { lat: 40.7, lng: -74.0 };
    mockService.updatePosition.mockResolvedValue({ id: 'tech-1', currentLat: 40.7, currentLng: -74.0 });

    const result = await controller.updatePosition('tech-1', dto, mockReq('co-1'));
    expect(result.currentLat).toBe(40.7);
  });

  it('should call remove on service', async () => {
    mockService.remove.mockResolvedValue({ id: 'tech-1' });

    const result = await controller.remove('tech-1', mockReq('co-1'));
    expect(result.id).toBe('tech-1');
  });
});
