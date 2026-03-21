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

  it('should return true for valid API key', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't-1', apiKey: 'valid-key' });
    const result = await service.validateApiKey('t-1', 'valid-key');
    expect(result).toBe(true);
  });

  it('should return false for invalid API key', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const result = await service.validateApiKey('t-1', 'bad-key');
    expect(result).toBe(false);
  });

  it('should query with tenantId and apiKey', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    await service.validateApiKey('t-1', 'key-1');
    expect(mockPrisma.tenant.findFirst).toHaveBeenCalledWith({
      where: { id: 't-1', apiKey: 'key-1' },
    });
  });

  it('should return false when tenant does not exist', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const result = await service.validateApiKey('nonexistent', 'any-key');
    expect(result).toBe(false);
  });
});
