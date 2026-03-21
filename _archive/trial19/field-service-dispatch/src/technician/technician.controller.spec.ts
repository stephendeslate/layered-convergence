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

const makeReq = (companyId = 'co-1') =>
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

  it('should call create', async () => {
    const dto = { companyId: 'co-1', name: 'John', email: 'j@t.com', skills: ['plumbing'] };
    mockService.create.mockResolvedValue({ id: 'tech-1', ...dto });

    const result = await controller.create(dto);
    expect(result.id).toBe('tech-1');
  });

  it('should call findAll with companyId from request', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    const req = makeReq();

    await controller.findAll(req);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('co-1');
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: 'tech-1' });
    const req = makeReq();

    await controller.findOne('tech-1', req);
    expect(mockService.findOne).toHaveBeenCalledWith('tech-1', 'co-1');
  });

  it('should call update with id, companyId, and dto', async () => {
    const dto = { name: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'tech-1', ...dto });
    const req = makeReq();

    await controller.update('tech-1', dto, req);
    expect(mockService.update).toHaveBeenCalledWith('tech-1', 'co-1', dto);
  });

  it('should call updatePosition', async () => {
    const dto = { lat: 40.7, lng: -74.0 };
    mockService.updatePosition.mockResolvedValue({ id: 'tech-1', currentLat: 40.7, currentLng: -74.0 });
    const req = makeReq();

    await controller.updatePosition('tech-1', dto, req);
    expect(mockService.updatePosition).toHaveBeenCalledWith('tech-1', 'co-1', 40.7, -74.0);
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: 'tech-1' });
    const req = makeReq();

    await controller.remove('tech-1', req);
    expect(mockService.remove).toHaveBeenCalledWith('tech-1', 'co-1');
  });
});
