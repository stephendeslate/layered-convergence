import { Test } from '@nestjs/testing';
import { TenantController } from './tenant.controller.js';
import { TenantService } from './tenant.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  regenerateApiKey: vi.fn(),
};

describe('TenantController', () => {
  let controller: TenantController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [{ provide: TenantService, useValue: mockService }],
    }).compile();

    controller = module.get(TenantController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on the service', async () => {
    const dto = { name: 'Test' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result.name).toBe('Test');
  });

  it('should call findAll on the service', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findOne on the service', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(mockService.findOne).toHaveBeenCalledWith('1');
    expect(result.id).toBe('1');
  });

  it('should call update on the service', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should call remove on the service', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    await controller.remove('1');
    expect(mockService.remove).toHaveBeenCalledWith('1');
  });

  it('should call regenerateApiKey on the service', async () => {
    mockService.regenerateApiKey.mockResolvedValue({ id: '1', apiKey: 'ak_new' });
    const result = await controller.regenerateApiKey('1');
    expect(mockService.regenerateApiKey).toHaveBeenCalledWith('1');
    expect(result.apiKey).toBe('ak_new');
  });
});
