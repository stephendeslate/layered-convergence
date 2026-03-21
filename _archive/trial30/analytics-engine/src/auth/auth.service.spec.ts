import { describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

function createMockPrisma() {
  return {
    tenant: {
      findUnique: async (args: any) =>
        args.where.apiKey === 'valid-key'
          ? { id: 'tenant-1', name: 'Test Tenant', apiKey: 'valid-key' }
          : null,
    },
  } as any;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(createMockPrisma());
  });

  it('should validate a valid API key', async () => {
    const result = await service.validateApiKey('valid-key');
    expect(result.id).toBe('tenant-1');
    expect(result.name).toBe('Test Tenant');
  });

  it('should throw for empty API key', async () => {
    await expect(service.validateApiKey('')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw for invalid API key', async () => {
    await expect(service.validateApiKey('bad-key')).rejects.toThrow(UnauthorizedException);
  });

  it('should validate tenant access with matching tenant', async () => {
    const result = await service.validateTenantAccess('valid-key', 'tenant-1');
    expect(result).toBe(true);
  });

  it('should reject tenant access with non-matching tenant', async () => {
    const result = await service.validateTenantAccess('valid-key', 'tenant-2');
    expect(result).toBe(false);
  });

  it('should throw UnauthorizedException for null API key', async () => {
    await expect(service.validateApiKey(null as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for undefined API key', async () => {
    await expect(service.validateApiKey(undefined as any)).rejects.toThrow(UnauthorizedException);
  });
});
