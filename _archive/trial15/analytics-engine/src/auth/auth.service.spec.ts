import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;

  const mockTenant = { id: 'tenant-1', name: 'Test', apiKey: 'key-123' };

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

  it('should return true for valid tenant+apiKey combination', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(mockTenant);
    const result = await service.validateApiKey('tenant-1', 'key-123');
    expect(result).toBe(true);
  });

  it('should return false for invalid apiKey', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const result = await service.validateApiKey('tenant-1', 'wrong-key');
    expect(result).toBe(false);
  });

  it('should return false for non-existent tenant', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const result = await service.validateApiKey('nonexistent', 'key-123');
    expect(result).toBe(false);
  });

  it('should call findFirst with tenantId and apiKey', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    await service.validateApiKey('t1', 'k1');
    expect(mockPrisma.tenant.findFirst).toHaveBeenCalledWith({
      where: { id: 't1', apiKey: 'k1' },
    });
  });
});
