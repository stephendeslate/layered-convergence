import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from './tenant.controller.js';
import { TenantService } from './tenant.service.js';

const mockTenantService = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('TenantController', () => {
  let controller: TenantController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [{ provide: TenantService, useValue: mockTenantService }],
    }).compile();

    controller = module.get<TenantController>(TenantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a tenant', async () => {
      const dto = { name: 'Acme Corp' };
      const expected = { id: '1', ...dto, apiKey: 'key-1' };
      mockTenantService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(result).toEqual(expected);
      expect(mockTenantService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findById', () => {
    it('should return a tenant', async () => {
      const expected = { id: '1', name: 'Acme Corp' };
      mockTenantService.findById.mockResolvedValue(expected);

      const result = await controller.findById('1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const dto = { name: 'New Name' };
      const expected = { id: '1', ...dto };
      mockTenantService.update.mockResolvedValue(expected);

      const result = await controller.update('1', dto);

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delete a tenant', async () => {
      mockTenantService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove('1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
