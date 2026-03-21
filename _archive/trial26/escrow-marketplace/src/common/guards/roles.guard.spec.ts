import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RolesGuard } from './roles.guard';
import { ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const mockReflector = {
    getAllAndOverride: vi.fn(),
  };

  const createContext = (user?: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(mockReflector as any);
  });

  it('should allow access when no roles required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const result = guard.canActivate(createContext({ role: 'BUYER' }) as any);
    expect(result).toBe(true);
  });

  it('should allow access when empty roles array', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    const result = guard.canActivate(createContext({ role: 'BUYER' }) as any);
    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const result = guard.canActivate(createContext({ role: 'ADMIN' }) as any);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createContext({ role: 'BUYER' }) as any)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user in request', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createContext(undefined) as any)).toThrow(ForbiddenException);
  });

  it('should allow when user role is in multiple required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'BUYER']);
    const result = guard.canActivate(createContext({ role: 'BUYER' }) as any);
    expect(result).toBe(true);
  });
});
