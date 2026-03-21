import { describe, it, expect, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { CompanyContextMiddleware } from './company-context.middleware';

const mockJwtService = {
  verify: vi.fn(),
};

describe('CompanyContextMiddleware', () => {
  const middleware = new CompanyContextMiddleware(mockJwtService as never);

  it('should throw if no authorization header', () => {
    const req = { headers: {} };
    const res = {};
    const next = vi.fn();

    expect(() => middleware.use(req as never, res as never, next)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if authorization header does not start with Bearer', () => {
    const req = { headers: { authorization: 'Basic abc' } };
    const res = {};
    const next = vi.fn();

    expect(() => middleware.use(req as never, res as never, next)).toThrow(
      UnauthorizedException,
    );
  });

  it('should set company context on valid token', () => {
    mockJwtService.verify.mockReturnValue({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'DISPATCHER',
      companyId: 'company-1',
    });

    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = {};
    const next = vi.fn();

    middleware.use(req as never, res as never, next);

    expect((req as Record<string, unknown>).companyId).toBe('company-1');
    expect((req as Record<string, unknown>).userId).toBe('user-1');
    expect((req as Record<string, unknown>).userRole).toBe('DISPATCHER');
    expect(next).toHaveBeenCalled();
  });

  it('should throw on invalid token', () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Invalid');
    });

    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = {};
    const next = vi.fn();

    expect(() => middleware.use(req as never, res as never, next)).toThrow(
      UnauthorizedException,
    );
  });
});
