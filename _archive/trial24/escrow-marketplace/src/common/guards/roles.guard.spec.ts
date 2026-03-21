import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RolesGuard } from './roles.guard';
import { ForbiddenException } from '@nestjs/common';

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

  it('should allow access when no roles required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createContext({ role: 'BUYER' }) as any)).toBe(true);
  });

  it('should allow access when roles array is empty', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    expect(guard.canActivate(createContext({ role: 'BUYER' }) as any)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(guard.canActivate(createContext({ role: 'ADMIN' }) as any)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createContext({ role: 'BUYER' }) as any)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user on request', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createContext(undefined) as any)).toThrow(ForbiddenException);
  });
});
