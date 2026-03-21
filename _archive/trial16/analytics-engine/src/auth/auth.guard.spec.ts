import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: any;

  const makeContext = (tenantId?: string, apiKey?: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        tenantId,
        headers: { 'x-api-key': apiKey },
      }),
    }),
  });

  beforeEach(() => {
    mockAuthService = {
      validateApiKey: vi.fn().mockResolvedValue(true),
    };
    guard = new AuthGuard(mockAuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow valid tenant+apiKey', async () => {
    const context = makeContext('tenant-1', 'key-123') as any;
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when tenantId is missing', async () => {
    const context = makeContext(undefined, 'key-123') as any;
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when apiKey is missing', async () => {
    const context = makeContext('tenant-1', undefined) as any;
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when apiKey is invalid', async () => {
    mockAuthService.validateApiKey.mockResolvedValue(false);
    const context = makeContext('tenant-1', 'bad-key') as any;
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should call authService.validateApiKey with correct args', async () => {
    const context = makeContext('tenant-1', 'key-123') as any;
    await guard.canActivate(context);
    expect(mockAuthService.validateApiKey).toHaveBeenCalledWith('tenant-1', 'key-123');
  });
});
