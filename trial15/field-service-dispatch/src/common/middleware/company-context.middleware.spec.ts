import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { CompanyContextMiddleware, CompanyRequest } from './company-context.middleware';
import { Response, NextFunction } from 'express';

function createMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'test-signature';
  return `${header}.${body}.${signature}`;
}

describe('CompanyContextMiddleware', () => {
  let middleware: CompanyContextMiddleware;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new CompanyContextMiddleware();
    mockRes = {} as Response;
    mockNext = vi.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should extract companyId from valid JWT and set on request', () => {
    const companyId = 'company-123';
    const token = createMockJwt({ companyId });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    middleware.use(req, mockRes, mockNext);

    expect(req.companyId).toBe(companyId);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when no authorization header', () => {
    const req = { headers: {} } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token format', () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token' },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token has no companyId', () => {
    const token = createMockJwt({ userId: 'user-123' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for malformed base64', () => {
    const req = {
      headers: { authorization: 'Bearer a.!!!.c' },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
  });

  it('should handle Bearer prefix correctly', () => {
    const companyId = 'company-456';
    const token = createMockJwt({ companyId });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    middleware.use(req, mockRes, mockNext);
    expect(req.companyId).toBe(companyId);
  });

  it('should call next() on success', () => {
    const token = createMockJwt({ companyId: 'test' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    middleware.use(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should not call next() on failure', () => {
    const req = { headers: {} } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle token without Bearer prefix in authorization header', () => {
    const req = {
      headers: { authorization: 'not-a-jwt' },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
  });

  it('should extract companyId with additional claims in payload', () => {
    const companyId = 'company-789';
    const token = createMockJwt({ companyId, role: 'admin', sub: 'user-1' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    middleware.use(req, mockRes, mockNext);
    expect(req.companyId).toBe(companyId);
  });
});
