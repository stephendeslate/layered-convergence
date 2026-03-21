import { describe, it, expect, beforeEach } from 'vitest';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  function createContext(user?: any, requiredRoles?: string[]): ExecutionContext {
    const request = { user };
    reflector.getAllAndOverride = () => requiredRoles as any;
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    const context = createContext(undefined, undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when roles array is empty', () => {
    const context = createContext(undefined, []);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const context = createContext({ role: 'ADMIN' }, ['ADMIN', 'DISPATCHER']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    const context = createContext({ role: 'CUSTOMER' }, ['ADMIN']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user present', () => {
    const context = createContext(undefined, ['ADMIN']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw with descriptive message', () => {
    const context = createContext({ role: 'CUSTOMER' }, ['ADMIN']);
    expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
  });
});
