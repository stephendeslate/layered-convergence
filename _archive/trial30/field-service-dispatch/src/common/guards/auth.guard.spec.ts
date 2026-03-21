import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AuthGuard(reflector);
  });

  const createContext = (headers: Record<string, string> = {}) => {
    const request = { headers, user: undefined as any };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => vi.fn(),
      getClass: () => vi.fn(),
      _request: request,
    } as any;
  };

  it('should allow public routes', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const ctx = createContext();
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw when no authorization header', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = createContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw when authorization header has no Bearer prefix', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = createContext({ authorization: 'Basic abc' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should parse valid token and set request.user', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const payload = { sub: 'u1', email: 'test@test.com', role: 'ADMIN', companyId: 'c1' };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const token = `header.${encodedPayload}.signature`;
    const ctx = createContext({ authorization: `Bearer ${token}` });

    expect(guard.canActivate(ctx)).toBe(true);
    expect(ctx._request.user).toEqual({
      userId: 'u1',
      email: 'test@test.com',
      role: 'ADMIN',
      companyId: 'c1',
    });
  });

  it('should throw for invalid token format', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = createContext({ authorization: 'Bearer invalidtoken' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
