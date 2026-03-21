import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createContext(role: string): ExecutionContext {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => ({ user: { role } }),
      }),
    } as any;
  }

  it('should allow access when no roles are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createContext('MEMBER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createContext('ADMIN');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createContext('MEMBER');
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow when user role is in the list', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'MEMBER']);
    const context = createContext('MEMBER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny VIEWER for ADMIN-only routes', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createContext('VIEWER');
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow when roles array is empty', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = createContext('VIEWER');
    expect(guard.canActivate(context)).toBe(true);
  });
});
