import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: any;
  let reflector: any;

  beforeEach(() => {
    jwtService = {
      verifyAsync: vi.fn(),
    };
    reflector = {
      getAllAndOverride: vi.fn(),
    };
    guard = new JwtAuthGuard(jwtService, reflector);
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
      user: null,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should allow access for public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    const context = createMockContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should allow access for valid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', role: 'BUYER' });
    const context = createMockContext('Bearer valid-token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should set user on request for valid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 'user-1', role: 'BUYER' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const context = createMockContext('Bearer valid-token');

    await guard.canActivate(context);

    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(payload);
  });

  it('should reject non-Bearer auth scheme', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Basic some-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
