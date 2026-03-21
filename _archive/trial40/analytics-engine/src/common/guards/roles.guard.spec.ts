import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  function createContext(user?: any): ExecutionContext {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles required', () => {
    (reflector.getAllAndOverride as any).mockReturnValue(undefined);
    expect(guard.canActivate(createContext({ role: 'USER' }))).toBe(true);
  });

  it('should allow access when roles array is empty', () => {
    (reflector.getAllAndOverride as any).mockReturnValue([]);
    expect(guard.canActivate(createContext({ role: 'USER' }))).toBe(true);
  });

  it('should allow access when user has required role', () => {
    (reflector.getAllAndOverride as any).mockReturnValue(['ADMIN']);
    expect(guard.canActivate(createContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    (reflector.getAllAndOverride as any).mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createContext({ role: 'USER' }))).toThrow(
      ForbiddenException,
    );
  });

  it('should throw when no user in request', () => {
    (reflector.getAllAndOverride as any).mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('should allow if user has one of multiple required roles', () => {
    (reflector.getAllAndOverride as any).mockReturnValue(['ADMIN', 'SUPER']);
    expect(guard.canActivate(createContext({ role: 'SUPER' }))).toBe(true);
  });
});
