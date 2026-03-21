import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

const mockReflector = {
  getAllAndOverride: vi.fn(),
};

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(mockReflector as any);
  });

  const createContext = (user?: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  it('should allow when no roles required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createContext({ role: UserRole.BUYER });
    expect(guard.canActivate(context as any)).toBe(true);
  });

  it('should allow when empty roles array', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    const context = createContext({ role: UserRole.BUYER });
    expect(guard.canActivate(context as any)).toBe(true);
  });

  it('should allow when user has required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = createContext({ role: UserRole.ADMIN });
    expect(guard.canActivate(context as any)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = createContext({ role: UserRole.BUYER });
    expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user in request', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = createContext(undefined);
    expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
  });

  it('should allow when user has one of multiple required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.PROVIDER]);
    const context = createContext({ role: UserRole.PROVIDER });
    expect(guard.canActivate(context as any)).toBe(true);
  });
});
