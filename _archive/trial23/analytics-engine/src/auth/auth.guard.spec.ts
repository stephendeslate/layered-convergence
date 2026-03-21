import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: { validateApiKey: ReturnType<typeof vi.fn> };

  const mockContext = (headers: Record<string, string> = {}) => {
    const request = { headers, tenantId: undefined as string | undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    } as unknown as ExecutionContext & { request: typeof request };
  };

  beforeEach(async () => {
    authService = {
      validateApiKey: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no x-api-key header', async () => {
    const ctx = mockContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw with message about missing header', async () => {
    const ctx = mockContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow('x-api-key header is required');
  });

  it('should call authService.validateApiKey with the key', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 't-1' });
    const ctx = mockContext({ 'x-api-key': 'my-key' });
    await guard.canActivate(ctx);
    expect(authService.validateApiKey).toHaveBeenCalledWith('my-key');
  });

  it('should set tenantId on request', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 'tenant-abc' });
    const ctx = mockContext({ 'x-api-key': 'valid' }) as any;
    await guard.canActivate(ctx);
    const request = ctx.switchToHttp().getRequest();
    expect(request.tenantId).toBe('tenant-abc');
  });

  it('should return true for valid API key', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 't-1' });
    const ctx = mockContext({ 'x-api-key': 'valid' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should propagate UnauthorizedException from authService', async () => {
    authService.validateApiKey.mockRejectedValue(
      new UnauthorizedException('Invalid API key'),
    );
    const ctx = mockContext({ 'x-api-key': 'bad' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Invalid API key');
  });
});
