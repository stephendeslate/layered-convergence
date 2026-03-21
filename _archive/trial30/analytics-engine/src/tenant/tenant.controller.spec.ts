import { describe, it, expect, beforeEach } from 'vitest';
import { TenantController } from './tenant.controller';

function createMockService() {
  return {
    create: async (dto: any) => ({ id: 'tenant-1', ...dto, apiKey: 'key-1' }),
    findAll: async () => [{ id: 'tenant-1', name: 'Test' }],
    findOne: async (id: string) => ({ id, name: 'Test' }),
    update: async (id: string, dto: any) => ({ id, ...dto }),
    remove: async (id: string) => ({ id }),
    regenerateApiKey: async (id: string) => ({ id, apiKey: 'new-key' }),
  } as any;
}

describe('TenantController', () => {
  let controller: TenantController;

  beforeEach(() => {
    controller = new TenantController(createMockService());
  });

  it('should create a tenant', async () => {
    const result = await controller.create({ name: 'Test' });
    expect(result.name).toBe('Test');
    expect(result.apiKey).toBeDefined();
  });

  it('should find all tenants', async () => {
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find one tenant', async () => {
    const result = await controller.findOne('tenant-1');
    expect(result.id).toBe('tenant-1');
  });

  it('should update a tenant', async () => {
    const result = await controller.update('tenant-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a tenant', async () => {
    const result = await controller.remove('tenant-1');
    expect(result.id).toBe('tenant-1');
  });

  it('should regenerate API key', async () => {
    const result = await controller.regenerateApiKey('tenant-1');
    expect(result.apiKey).toBe('new-key');
  });
});
