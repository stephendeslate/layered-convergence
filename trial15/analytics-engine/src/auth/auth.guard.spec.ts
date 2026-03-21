import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthGuard } from './auth.guard';
import { AuthService, JwtPayload } from './auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

function createMockContext(authHeader?: string): ExecutionContext {
  const request: Record<string, any> = {
    headers: authHeader ? { authorization: authHeader } : {},
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getType: () => 'http' as const,
    getClass: () => ({} as any),
    getHandler: () => ({} as any),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      extractTokenFromHeader: vi.fn(),
      verify: vi.fn(),
      validate: vi.fn(),
    } as any;
    guard = new AuthGuard(authService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no token is provided', () => {
    vi.mocked(authService.extractTokenFromHeader).mockReturnValue(null);
    const context = createMockContext();

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid', () => {
    vi.mocked(authService.extractTokenFromHeader).mockReturnValue('bad-token');
    vi.mocked(authService.verify).mockImplementation(() => {
      throw new UnauthorizedException('Invalid token');
    });
    const context = createMockContext('Bearer bad-token');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow access with valid token and set user on request', () => {
    const payload: JwtPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'admin',
    };

    vi.mocked(authService.extractTokenFromHeader).mockReturnValue('valid-token');
    vi.mocked(authService.verify).mockReturnValue(payload);
    vi.mocked(authService.validate).mockReturnValue(payload);

    const context = createMockContext('Bearer valid-token');
    const result = guard.canActivate(context);

    expect(result).toBe(true);

    const request = context.switchToHttp().getRequest() as any;
    expect(request['user']).toEqual(payload);
    expect(request['tenantId']).toBe('tenant-1');
  });

  it('should call extractTokenFromHeader with the authorization header', () => {
    vi.mocked(authService.extractTokenFromHeader).mockReturnValue(null);
    const context = createMockContext('Bearer some-token');

    try {
      guard.canActivate(context);
    } catch {
      // expected
    }

    expect(authService.extractTokenFromHeader).toHaveBeenCalledWith('Bearer some-token');
  });

  it('should call verify then validate in sequence', () => {
    const payload: JwtPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'admin',
    };

    vi.mocked(authService.extractTokenFromHeader).mockReturnValue('token');
    vi.mocked(authService.verify).mockReturnValue(payload);
    vi.mocked(authService.validate).mockReturnValue(payload);

    const context = createMockContext('Bearer token');
    guard.canActivate(context);

    expect(authService.verify).toHaveBeenCalledWith('token');
    expect(authService.validate).toHaveBeenCalledWith(payload);
  });

  it('should throw when validate fails', () => {
    vi.mocked(authService.extractTokenFromHeader).mockReturnValue('token');
    vi.mocked(authService.verify).mockReturnValue({
      sub: '',
      email: '',
      tenantId: '',
      role: '',
    });
    vi.mocked(authService.validate).mockImplementation(() => {
      throw new UnauthorizedException('Invalid payload');
    });

    const context = createMockContext('Bearer token');
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
