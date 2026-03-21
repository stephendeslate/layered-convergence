import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      tenant: {
        findFirst: vi.fn(),
      },
    };
    service = new AuthService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true when tenant with matching apiKey exists', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't1', apiKey: 'key-1' });
    const result = await service.validateApiKey('t1', 'key-1');
    expect(result).toBe(true);
  });

  it('should return false when tenant is not found', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const result = await service.validateApiKey('t1', 'wrong-key');
    expect(result).toBe(false);
  });

  it('should query with both tenantId and apiKey', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    await service.validateApiKey('tenant-id', 'api-key');
    expect(mockPrisma.tenant.findFirst).toHaveBeenCalledWith({
      where: { id: 'tenant-id', apiKey: 'api-key' },
    });
  });

  it('should return false for empty apiKey', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const result = await service.validateApiKey('t1', '');
    expect(result).toBe(false);
  });

  it('should return false for mismatched apiKey', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const result = await service.validateApiKey('t1', 'different-key');
    expect(result).toBe(false);
  });
});
