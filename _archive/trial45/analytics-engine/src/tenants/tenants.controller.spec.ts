import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: any;

  const mockTenant = { id: 'tenant-1', name: 'Test' };

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue(mockTenant),
      findAll: vi.fn().mockResolvedValue([mockTenant]),
      findById: vi.fn().mockResolvedValue(mockTenant),
      update: vi.fn().mockResolvedValue(mockTenant),
      remove: vi.fn().mockResolvedValue(mockTenant),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [{ provide: TenantsService, useValue: service }],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create tenant', async () => {
    const result = await controller.create({ name: 'Test' });
    expect(result).toEqual(mockTenant);
  });

  it('should find all tenants', async () => {
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find tenant by id', async () => {
    const result = await controller.findById('tenant-1');
    expect(result.id).toBe('tenant-1');
  });

  it('should update tenant', async () => {
    await controller.update('tenant-1', { name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('tenant-1', { name: 'Updated' });
  });

  it('should remove tenant', async () => {
    await controller.remove('tenant-1');
    expect(service.remove).toHaveBeenCalledWith('tenant-1');
  });
});
