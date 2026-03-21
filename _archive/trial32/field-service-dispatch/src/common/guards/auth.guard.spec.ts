import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthGuard, Reflector],
    }).compile();

    guard = module.get(AuthGuard);
    reflector = module.get(Reflector);
  });

  const createContext = (headers: Record<string, string> = {}) => ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: undefined }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  it('should allow public routes', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const ctx = createContext();
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('should throw UnauthorizedException when no auth header', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = createContext({});
    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it('should throw when token is not Bearer', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = createContext({ authorization: 'Basic abc' });
    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it('should parse valid token and set user on request', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const payload = { sub: '1', email: 'test@test.com', role: 'ADMIN', companyId: 'c1' };
    const token = `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`;
    const request = { headers: { authorization: `Bearer ${token}` }, user: undefined as any };

    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    expect(guard.canActivate(ctx as any)).toBe(true);
    expect(request.user.userId).toBe('1');
    expect(request.user.companyId).toBe('c1');
  });

  it('should throw for invalid token payload', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const ctx = createContext({ authorization: 'Bearer invalid.token.here' });
    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });
});
