import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = {
      verifyAsync: vi.fn(),
    } as any;
    guard = new JwtAuthGuard(jwtService);
  });

  function createMockContext(authHeader?: string): ExecutionContext {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access with valid token', async () => {
    const payload = { sub: 'user-1', email: 'test@test.com', companyId: 'c1', role: 'ADMIN' };
    vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload);

    const context = createMockContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });

  it('should throw UnauthorizedException when no token', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when invalid token format', async () => {
    const context = createMockContext('InvalidFormat token');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token verification fails', async () => {
    vi.mocked(jwtService.verifyAsync).mockRejectedValue(new Error('Invalid'));
    const context = createMockContext('Bearer bad-token');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should set user on request after successful verification', async () => {
    const payload = { sub: 'user-1', email: 'a@b.com', companyId: 'c1', role: 'ADMIN' };
    vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload);

    const context = createMockContext('Bearer valid-token');
    await guard.canActivate(context);

    const request = context.switchToHttp().getRequest() as any;
    expect(request.user).toEqual(payload);
  });

  it('should reject Basic auth scheme', async () => {
    const context = createMockContext('Basic dXNlcjpwYXNz');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
