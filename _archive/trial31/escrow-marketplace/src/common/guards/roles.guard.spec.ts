import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RolesGuard } from './roles.guard';
import { ForbiddenException } from '@nestjs/common';

const mockReflector = {
  getAllAndOverride: vi.fn(),
};

function createMockContext(user?: any) {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  };
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(mockReflector as any);
  });

  it('should allow when no roles required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = createMockContext();
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('should allow when empty roles array', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    const ctx = createMockContext();
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('should allow when user has required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const ctx = createMockContext({ role: 'ADMIN' });
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const ctx = createMockContext({ role: 'BUYER' });
    expect(() => guard.canActivate(ctx as any)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user in request', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx as any)).toThrow(ForbiddenException);
  });

  it('should allow when user has one of multiple required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'PROVIDER']);
    const ctx = createMockContext({ role: 'PROVIDER' });
    expect(guard.canActivate(ctx as any)).toBe(true);
  });
});
