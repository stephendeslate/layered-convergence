import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: { validateApiKey: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = { validateApiKey: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    guard = module.get(AuthGuard);
  });

  function createContext(headers: Record<string, string> = {}): ExecutionContext {
    const request = { headers, tenantId: undefined as string | undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow request with valid API key', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 'tenant-1' });
    const ctx = createContext({ 'x-api-key': 'valid-key' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should set tenantId on request', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 'tenant-1' });
    const ctx = createContext({ 'x-api-key': 'valid-key' });
    await guard.canActivate(ctx);
    const request = ctx.switchToHttp().getRequest();
    expect(request.tenantId).toBe('tenant-1');
  });

  it('should throw UnauthorizedException when x-api-key header is missing', async () => {
    const ctx = createContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw with message about missing header', async () => {
    const ctx = createContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow('x-api-key header is required');
  });

  it('should call authService.validateApiKey with the header value', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 'tenant-1' });
    const ctx = createContext({ 'x-api-key': 'my-key' });
    await guard.canActivate(ctx);
    expect(authService.validateApiKey).toHaveBeenCalledWith('my-key');
  });

  it('should propagate errors from authService', async () => {
    authService.validateApiKey.mockRejectedValue(new UnauthorizedException('Invalid'));
    const ctx = createContext({ 'x-api-key': 'bad' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
