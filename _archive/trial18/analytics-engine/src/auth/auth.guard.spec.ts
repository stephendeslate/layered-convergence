import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: { validateApiKey: ReturnType<typeof vi.fn> };

  const createMockContext = (headers: Record<string, string> = {}): ExecutionContext => {
    const request = { headers, tenantId: undefined as string | undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => vi.fn(),
      }),
      getArgs: vi.fn(),
      getArgByIndex: vi.fn(),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
      getType: vi.fn(),
      getClass: vi.fn(),
      getHandler: vi.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    authService = {
      validateApiKey: vi.fn().mockResolvedValue({ tenantId: 'tenant-1' }),
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

  it('should allow request with valid API key', async () => {
    const context = createMockContext({ 'x-api-key': 'valid-key' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when x-api-key header is missing', async () => {
    const context = createMockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set tenantId on request', async () => {
    const context = createMockContext({ 'x-api-key': 'valid-key' });
    await guard.canActivate(context);
    const request = context.switchToHttp().getRequest();
    expect(request.tenantId).toBe('tenant-1');
  });

  it('should call authService.validateApiKey with the API key', async () => {
    const context = createMockContext({ 'x-api-key': 'my-key' });
    await guard.canActivate(context);
    expect(authService.validateApiKey).toHaveBeenCalledWith('my-key');
  });

  it('should propagate UnauthorizedException from authService', async () => {
    authService.validateApiKey.mockRejectedValue(
      new UnauthorizedException('Invalid API key'),
    );
    const context = createMockContext({ 'x-api-key': 'bad-key' });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
