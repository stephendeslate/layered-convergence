import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

function createMockContext(headers: Record<string, string> = {}): ExecutionContext {
  const request: Record<string, unknown> = { headers };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => vi.fn(),
    }),
    getHandler: () => vi.fn(),
    getClass: () => Object,
    getArgs: () => [],
    getArgByIndex: () => null,
    switchToRpc: () => ({ getContext: vi.fn(), getData: vi.fn() }),
    switchToWs: () => ({ getClient: vi.fn(), getData: vi.fn(), getPattern: vi.fn() }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: { validateApiKey: ReturnType<typeof import('vitest').vi.fn> };

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

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no x-api-key header', async () => {
    const ctx = createMockContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true and set tenantId on request for valid key', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 'tenant-1' });
    const ctx = createMockContext({ 'x-api-key': 'valid-key' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    const request = ctx.switchToHttp().getRequest() as Record<string, unknown>;
    expect(request.tenantId).toBe('tenant-1');
  });

  it('should throw when AuthService throws', async () => {
    authService.validateApiKey.mockRejectedValue(new UnauthorizedException('Invalid'));
    const ctx = createMockContext({ 'x-api-key': 'bad-key' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should pass the API key to authService', async () => {
    authService.validateApiKey.mockResolvedValue({ tenantId: 't1' });
    const ctx = createMockContext({ 'x-api-key': 'test-key-123' });
    await guard.canActivate(ctx);
    expect(authService.validateApiKey).toHaveBeenCalledWith('test-key-123');
  });
});
