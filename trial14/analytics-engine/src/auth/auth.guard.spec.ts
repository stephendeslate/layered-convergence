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
      validateApiKey: vi.fn(),
    };
    guard = new AuthGuard(mockAuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when tenant context is missing', async () => {
    const ctx = makeContext(undefined, 'some-key') as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when API key is missing', async () => {
    const ctx = makeContext('t-1', undefined) as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when API key is invalid', async () => {
    mockAuthService.validateApiKey.mockResolvedValue(false);
    const ctx = makeContext('t-1', 'bad-key') as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true when API key is valid', async () => {
    mockAuthService.validateApiKey.mockResolvedValue(true);
    const ctx = makeContext('t-1', 'good-key') as any;
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should call validateApiKey with correct arguments', async () => {
    mockAuthService.validateApiKey.mockResolvedValue(true);
    const ctx = makeContext('t-1', 'key-abc') as any;
    await guard.canActivate(ctx);
    expect(mockAuthService.validateApiKey).toHaveBeenCalledWith('t-1', 'key-abc');
  });

  it('should throw with "Missing tenant context" message', async () => {
    const ctx = makeContext(undefined, 'some-key') as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow('Missing tenant context');
  });

  it('should throw with "Missing x-api-key header" message', async () => {
    const ctx = makeContext('t-1', undefined) as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow('Missing x-api-key header');
  });
});
