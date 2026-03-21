import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';

vi.stubEnv('JWT_SECRET', 'test-secret-for-unit-tests');

import * as jwt from 'jsonwebtoken';
import { CompanyContextMiddleware } from './company-context.middleware';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

describe('CompanyContextMiddleware', () => {
  let middleware: CompanyContextMiddleware;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    middleware = new CompanyContextMiddleware();
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should throw UnauthorizedException when no authorization header', () => {
    expect(() => middleware.use(mockReq, mockRes, mockNext)).toThrow(UnauthorizedException);
    expect(() => middleware.use(mockReq, mockRes, mockNext)).toThrow('Authorization header required');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should extract payload from valid JWT and call next', () => {
    mockReq.headers.authorization = 'Bearer valid-token';
    (jwt.verify as any).mockReturnValue({
      userId: 'user-1',
      companyId: 'company-1',
      role: 'ADMIN',
    });

    middleware.use(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret-for-unit-tests');
    expect(mockReq.companyId).toBe('company-1');
    expect(mockReq.userId).toBe('user-1');
    expect(mockReq.userRole).toBe('ADMIN');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException for invalid token', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    (jwt.verify as any).mockImplementation(() => {
      throw new Error('invalid token');
    });

    expect(() => middleware.use(mockReq, mockRes, mockNext)).toThrow(UnauthorizedException);
    expect(() => middleware.use(mockReq, mockRes, mockNext)).toThrow('Invalid or expired token');
    expect(mockNext).not.toHaveBeenCalled();
  });
});
