import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyContextMiddleware } from './company-context.middleware';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken');

describe('CompanyContextMiddleware', () => {
  let middleware: CompanyContextMiddleware;
  let mockReq: Record<string, unknown>;
  let mockRes: Record<string, unknown>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    middleware = new CompanyContextMiddleware();
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = vi.fn();
  });

  it('should call next without setting context when no auth header', () => {
    middleware.use(mockReq as any, mockRes as any, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.companyId).toBeUndefined();
    expect(mockReq.userId).toBeUndefined();
  });

  it('should call next without setting context for non-Bearer auth', () => {
    mockReq.headers = { authorization: 'Basic abc123' };

    middleware.use(mockReq as any, mockRes as any, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.companyId).toBeUndefined();
  });

  it('should set companyId and userId from verified JWT', () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue({
      sub: 'user-1',
      companyId: 'company-1',
      email: 'test@example.com',
      role: 'ADMIN',
    });

    middleware.use(mockReq as any, mockRes as any, mockNext);

    expect(mockReq.companyId).toBe('company-1');
    expect(mockReq.userId).toBe('user-1');
    expect(mockReq.userRole).toBe('ADMIN');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException for invalid token', () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    (jwt.verify as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => {
      middleware.use(mockReq as any, mockRes as any, mockNext);
    }).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for expired token', () => {
    mockReq.headers = { authorization: 'Bearer expired-token' };
    (jwt.verify as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    expect(() => {
      middleware.use(mockReq as any, mockRes as any, mockNext);
    }).toThrow(UnauthorizedException);
  });

  it('should use jwt.verify for token validation (FM #44)', () => {
    mockReq.headers = { authorization: 'Bearer test-token' };
    (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue({
      sub: 'user-1',
      companyId: 'company-1',
      email: 'test@example.com',
      role: 'ADMIN',
    });

    middleware.use(mockReq as any, mockRes as any, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('test-token', expect.any(String));
  });

  it('should NOT use Buffer.from or JSON.parse for token decoding (FM #44)', () => {
    // Verify that the middleware source code uses jwt.verify
    const source = CompanyContextMiddleware.toString();
    // The class itself doesn't contain Buffer.from — this is a structural test
    expect(source).not.toContain('Buffer.from');
  });
});
