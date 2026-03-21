import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

const mockConfig = {
  get: vi.fn().mockReturnValue('test-secret'),
};

const mockReflector = {
  getAllAndOverride: vi.fn(),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthGuard(mockConfig as any, mockReflector as any);
  });

  const createContext = (headers: any = {}) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
        user: undefined,
      }),
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
    const context = createContext({});

    expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as any).mockImplementation(() => { throw new Error('invalid'); });
    const context = createContext({ authorization: 'Bearer bad-token' });

    expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
  });

  it('should set user on request for valid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 'user-1', email: 'test@test.com', role: 'BUYER', tenantId: 'default' };
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

  it('should not extract token if auth type is not Bearer', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createContext({ authorization: 'Basic abc123' });

    expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
  });
});
