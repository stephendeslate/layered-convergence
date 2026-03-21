import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let prisma: any;
  let reflector: Reflector;

  const createContext = (authHeader?: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: authHeader },
        user: null,
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
      },
    };
    reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    guard = new AuthGuard(prisma, reflector);
  });

  it('should throw if no authorization header', async () => {
    const ctx = createContext(undefined);
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if header does not start with Basic', async () => {
    const ctx = createContext('Bearer token');
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if token decodes to invalid format', async () => {
    const token = Buffer.from('no-colon').toString('base64');
    const ctx = createContext(`Basic ${token}`);
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const token = Buffer.from('test@test.com:pass').toString('base64');
    const ctx = createContext(`Basic ${token}`);
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if password does not match', async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'test@test.com',
      password: 'correct',
      role: 'BUYER',
    });
    const token = Buffer.from('test@test.com:wrong').toString('base64');
    const ctx = createContext(`Basic ${token}`);
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true for valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'test@test.com',
      password: 'pass123',
      role: 'BUYER',
    });
    const token = Buffer.from('test@test.com:pass123').toString('base64');
    const ctx = createContext(`Basic ${token}`);
    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
  });

  it('should throw if user role does not match required roles', async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'test@test.com',
      password: 'pass123',
      role: 'BUYER',
    });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const token = Buffer.from('test@test.com:pass123').toString('base64');
    const ctx = createContext(`Basic ${token}`);
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should allow if user role matches required roles', async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'admin@test.com',
      password: 'admin',
      role: 'ADMIN',
    });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const token = Buffer.from('admin@test.com:admin').toString('base64');
    const ctx = createContext(`Basic ${token}`);
    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
  });
});
