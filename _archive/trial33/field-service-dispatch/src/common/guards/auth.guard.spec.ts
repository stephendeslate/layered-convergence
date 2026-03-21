import { describe, it, expect, beforeEach } from 'vitest';
import { AuthGuard, IS_PUBLIC_KEY } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  function createContext(headers: Record<string, string> = {}, isPublic = false): ExecutionContext {
    const request = { headers, user: undefined as any };
    reflector.getAllAndOverride = () => isPublic as any;
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AuthGuard(reflector);
  });

  it('should allow access for public routes', () => {
    const context = createContext({}, true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when no authorization header', () => {
    const context = createContext({});
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-Bearer tokens', () => {
    const context = createContext({ authorization: 'Basic abc123' });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token payload', () => {
    const context = createContext({ authorization: 'Bearer invalid.token.here' });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should parse valid Bearer token and set request.user', () => {
    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
      companyId: 'company-1',
    };
    const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `${header}.${payloadStr}.signature`;

    const request = { headers: { authorization: `Bearer ${token}` }, user: undefined as any };
    reflector.getAllAndOverride = () => false as any;
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({
      userId: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
      companyId: 'company-1',
    });
  });

  it('should have IS_PUBLIC_KEY exported', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
