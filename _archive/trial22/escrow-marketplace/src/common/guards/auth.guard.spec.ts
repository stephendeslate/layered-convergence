import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

const mockConfigService = {
  get: vi.fn().mockReturnValue('test-secret'),
};

const mockReflector = {
  getAllAndOverride: vi.fn(),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthGuard(mockConfigService as any, mockReflector as any);
  });

  const createContext = (headers: Record<string, string> = {}) => ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: null }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  it('should allow public routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = createContext();
    expect(guard.canActivate(context as any)).toBe(true);
  });

  it('should throw UnauthorizedException when no token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createContext();
    expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as any).mockImplementation(() => { throw new Error('invalid'); });
    const context = createContext({ authorization: 'Bearer invalid-token' });
    expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
  });

  it('should set user on request for valid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 'user-1', email: 'test@test.com', role: 'BUYER', tenantId: 'default' };
    (jwt.verify as any).mockReturnValue(payload);
    const request = { headers: { authorization: 'Bearer valid-token' }, user: null as any };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    const result = guard.canActivate(context as any);
    expect(result).toBe(true);
    expect(request.user).toEqual(payload);
  });

  it('should reject non-Bearer tokens', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createContext({ authorization: 'Basic abc123' });
    expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
  });

  it('should handle missing authorization header', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createContext({});
    expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
  });
});
