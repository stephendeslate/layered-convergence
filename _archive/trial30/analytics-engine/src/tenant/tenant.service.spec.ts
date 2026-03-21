import { describe, it, expect, beforeEach } from 'vitest';
import { TenantService } from './tenant.service';

function createMockPrisma() {
  return {
    tenant: {
      create: async (args: any) => ({ id: 'tenant-1', apiKey: 'generated-key', ...args.data }),
      findMany: async () => [{ id: 'tenant-1', name: 'Test Tenant' }],
      findUnique: async (args: any) => (args.where.apiKey === 'valid-key' ? { id: 'tenant-1', apiKey: 'valid-key' } : null),
      findUniqueOrThrow: async () => ({ id: 'tenant-1', name: 'Test Tenant', apiKey: 'key-1' }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
    },
  } as any;
}

describe('TenantService', () => {
  let service: TenantService;
  let prisma: any;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new TenantService(prisma);
  });

  it('should create a tenant with a generated API key', async () => {
    const result = await service.create({ name: 'New Tenant' });
    expect(result.name).toBe('New Tenant');
    expect(result.apiKey).toBeDefined();
  });

  it('should find all tenants', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find one tenant by id', async () => {
    const result = await service.findOne('tenant-1');
    expect(result.id).toBe('tenant-1');
  });

  it('should find a tenant by API key', async () => {
    const result = await service.findByApiKey('valid-key');
    expect(result).toBeDefined();
    expect(result!.apiKey).toBe('valid-key');
  });

  it('should return null for invalid API key', async () => {
    const result = await service.findByApiKey('invalid-key');
    expect(result).toBeNull();
  });

  it('should update a tenant', async () => {
    const result = await service.update('tenant-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a tenant', async () => {
    const result = await service.remove('tenant-1');
    expect(result.id).toBe('tenant-1');
  });

  it('should regenerate API key', async () => {
    const result = await service.regenerateApiKey('tenant-1');
    expect(result.apiKey).toBeDefined();
  });

  it('should create tenant with optional branding fields', async () => {
    const result = await service.create({
      name: 'Branded Tenant',
      primaryColor: '#FF0000',
      fontFamily: 'Arial',
    });
    expect(result.name).toBe('Branded Tenant');
    expect(result.primaryColor).toBe('#FF0000');
  });
});
