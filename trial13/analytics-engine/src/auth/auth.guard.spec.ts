import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      validateApiKey: vi.fn(),
    };
    guard = new AuthGuard(mockAuthService);
  });

  const createContext = (tenantId?: string, apiKey?: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        tenantId,
        headers: { 'x-api-key': apiKey },
      }),
    }),
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when tenantId is missing', async () => {
    const ctx = createContext(undefined, 'key') as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when x-api-key is missing', async () => {
    const ctx = createContext('t1', undefined) as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when apiKey is invalid', async () => {
    mockAuthService.validateApiKey.mockResolvedValue(false);
    const ctx = createContext('t1', 'invalid') as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true when apiKey is valid', async () => {
    mockAuthService.validateApiKey.mockResolvedValue(true);
    const ctx = createContext('t1', 'valid-key') as any;
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should call authService.validateApiKey with correct params', async () => {
    mockAuthService.validateApiKey.mockResolvedValue(true);
    const ctx = createContext('tenant-x', 'key-y') as any;
    await guard.canActivate(ctx);
    expect(mockAuthService.validateApiKey).toHaveBeenCalledWith('tenant-x', 'key-y');
  });
});
