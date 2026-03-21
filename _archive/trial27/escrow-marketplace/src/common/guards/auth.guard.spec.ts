import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const mockConfigService = {
    get: vi.fn().mockReturnValue('test-secret'),
  };

  const mockReflector = {
    getAllAndOverride: vi.fn(),
  };

  const createContext = (headers: Record<string, string> = {}) => ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: undefined }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthGuard(mockConfigService as any, mockReflector as any);
  });

  it('should allow access for public routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const result = guard.canActivate(createContext() as any);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    expect(() => guard.canActivate(createContext() as any)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for missing Authorization header', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    expect(() => guard.canActivate(createContext({}) as any)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-Bearer token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    expect(() => guard.canActivate(createContext({ authorization: 'Basic abc123' }) as any)).toThrow(UnauthorizedException);
  });

  it('should set user on request for valid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: '1', email: 'test@test.com', role: 'BUYER', tenantId: 'default' };
    (jwt.verify as any).mockReturnValue(payload);

    const request = { headers: { authorization: 'Bearer valid-token' }, user: undefined as any };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    const result = guard.canActivate(context as any);

    expect(result).toBe(true);
    expect(request.user).toEqual(payload);
  });

  it('should throw UnauthorizedException for invalid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as any).mockImplementation(() => { throw new Error('invalid'); });

    expect(() =>
      guard.canActivate(createContext({ authorization: 'Bearer invalid-token' }) as any),
    ).toThrow(UnauthorizedException);
  });
});
