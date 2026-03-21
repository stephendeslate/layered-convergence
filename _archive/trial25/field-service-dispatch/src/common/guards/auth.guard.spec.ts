import { describe, it, expect, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { createHash } from 'crypto';

function createMockContext(headers: Record<string, string> = {}): ExecutionContext {
  const request = { headers } as any;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function generateTestToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      companyId: 'comp-1',
    }),
  ).toString('base64url');
  const sig = createHash('sha256').update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

describe('AuthGuard', () => {
  it('should allow public routes', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const guard = new AuthGuard(reflector);

    const ctx = createMockContext();
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException when no Authorization header', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const guard = new AuthGuard(reflector);

    const ctx = createMockContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when Bearer prefix missing', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const guard = new AuthGuard(reflector);

    const ctx = createMockContext({ authorization: 'Basic abc' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const guard = new AuthGuard(reflector);

    const ctx = createMockContext({ authorization: 'Bearer invalid.token' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should parse valid token and set user on request', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const guard = new AuthGuard(reflector);

    const token = generateTestToken();
    const request = { headers: { authorization: `Bearer ${token}` } } as any;
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
    expect(request.user.email).toBe('test@test.com');
    expect(request.user.role).toBe('ADMIN');
    expect(request.user.companyId).toBe('comp-1');
  });
});
