import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard, IS_PUBLIC_KEY } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
  verify: vi.fn(),
}));

import * as jwt from 'jsonwebtoken';

const mockConfigService = {
  get: vi.fn().mockReturnValue('test-secret'),
};

const mockReflector = {
  getAllAndOverride: vi.fn(),
};

function createMockContext(headers: Record<string, string> = {}) {
  const request = { headers, user: undefined as any };
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    _request: request,
  };
}

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthGuard(mockConfigService as any, mockReflector as any);
  });

  it('should allow public routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const ctx = createMockContext();
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('should throw UnauthorizedException when no token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const ctx = createMockContext({});
    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-Bearer token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const ctx = createMockContext({ authorization: 'Basic abc123' });
    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it('should set user on request for valid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 'user-1', email: 'user@test.com', role: 'BUYER', tenantId: 'tenant-1' };
    (jwt.verify as any).mockReturnValue(payload);

    const ctx = createMockContext({ authorization: 'Bearer valid-token' });
    const result = guard.canActivate(ctx as any);

    expect(result).toBe(true);
    expect(ctx._request.user).toEqual(payload);
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
  });

  it('should throw UnauthorizedException for invalid token', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as any).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const ctx = createMockContext({ authorization: 'Bearer invalid-token' });
    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it('should export IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
