import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

function createMockContext(headers: Record<string, string>): ExecutionContext {
  const request = { headers, tenantId: undefined as string | undefined };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => vi.fn(),
    }),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getType: () => 'http' as any,
    getClass: () => Object as any,
    getHandler: () => vi.fn() as any,
  };
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: { validateApiKey: ReturnType<typeof vi.fn> };

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

  it('should allow access with valid API key', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 'tenant-1' });
    const context = createMockContext({ 'x-api-key': 'valid-key' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should set tenantId on request', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 'tenant-1' });
    const context = createMockContext({ 'x-api-key': 'valid-key' });

    await guard.canActivate(context);
    const request = context.switchToHttp().getRequest();
    expect(request.tenantId).toBe('tenant-1');
  });

  it('should throw when x-api-key header is missing', async () => {
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw when API key is invalid', async () => {
    authService.validateApiKey.mockRejectedValue(
      new UnauthorizedException('Invalid API key'),
    );
    const context = createMockContext({ 'x-api-key': 'bad-key' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
