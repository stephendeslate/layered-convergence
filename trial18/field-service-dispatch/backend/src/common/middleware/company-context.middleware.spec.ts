import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { CompanyContextMiddleware } from './company-context.middleware';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { Response, NextFunction } from 'express';

describe('CompanyContextMiddleware', () => {
  let middleware: CompanyContextMiddleware;
  let jwtService: { verify: ReturnType<typeof vi.fn> };
  let next: NextFunction;

  beforeEach(() => {
    jwtService = { verify: vi.fn() };
    middleware = new CompanyContextMiddleware(jwtService as unknown as JwtService);
    next = vi.fn();
  });

  it('should throw UnauthorizedException when no auth header', () => {
    const req = { headers: {} } as AuthenticatedRequest;
    expect(() => middleware.use(req, {} as Response, next)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid' } } as AuthenticatedRequest;
    jwtService.verify.mockImplementation(() => {
      throw new Error('Invalid');
    });
    expect(() => middleware.use(req, {} as Response, next)).toThrow(UnauthorizedException);
  });

  it('should set companyId, userId, userRole on request for valid token', () => {
    const req = { headers: { authorization: 'Bearer valid-token' } } as AuthenticatedRequest;
    jwtService.verify.mockReturnValue({
      sub: 'user-1',
      email: 'user@test.com',
      role: 'TECHNICIAN',
      companyId: 'company-1',
    });

    middleware.use(req, {} as Response, next);

    expect(req.companyId).toBe('company-1');
    expect(req.userId).toBe('user-1');
    expect(req.userRole).toBe('TECHNICIAN');
    expect(next).toHaveBeenCalled();
  });
});
