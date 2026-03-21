import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { CompanyContextMiddleware, CompanyRequest } from './company-context.middleware';
import { Response, NextFunction } from 'express';
import { vi } from 'vitest';

function createMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = Buffer.from('test-signature').toString('base64');
  return `${header}.${body}.${signature}`;
}

describe('CompanyContext Auth (Integration)', () => {
  let middleware: CompanyContextMiddleware;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyContextMiddleware],
    }).compile();

    middleware = module.get<CompanyContextMiddleware>(CompanyContextMiddleware);
    mockRes = {} as Response;
    mockNext = vi.fn();
  });

  it('should extract companyId from valid JWT token', () => {
    const companyId = 'integration-test-company';
    const token = createMockJwt({ companyId, sub: 'user-1', role: 'admin' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    middleware.use(req, mockRes, mockNext);

    expect(req.companyId).toBe(companyId);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should reject requests without Authorization header', () => {
    const req = { headers: {} } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject requests with empty Authorization header', () => {
    const req = {
      headers: { authorization: '' },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject malformed JWT tokens', () => {
    const req = {
      headers: { authorization: 'Bearer not-a-jwt' },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject JWT without companyId claim', () => {
    const token = createMockJwt({ sub: 'user-1', role: 'admin' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle JWT with additional claims', () => {
    const companyId = 'company-with-extras';
    const token = createMockJwt({
      companyId,
      sub: 'user-1',
      role: 'admin',
      permissions: ['read', 'write'],
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    middleware.use(req, mockRes, mockNext);

    expect(req.companyId).toBe(companyId);
  });

  it('should handle multiple sequential requests independently', () => {
    const companyA = 'company-a';
    const companyB = 'company-b';

    const tokenA = createMockJwt({ companyId: companyA });
    const tokenB = createMockJwt({ companyId: companyB });

    const reqA = {
      headers: { authorization: `Bearer ${tokenA}` },
    } as unknown as CompanyRequest;

    const reqB = {
      headers: { authorization: `Bearer ${tokenB}` },
    } as unknown as CompanyRequest;

    const nextA = vi.fn();
    const nextB = vi.fn();

    middleware.use(reqA, mockRes, nextA);
    middleware.use(reqB, mockRes, nextB);

    expect(reqA.companyId).toBe(companyA);
    expect(reqB.companyId).toBe(companyB);
    expect(nextA).toHaveBeenCalledTimes(1);
    expect(nextB).toHaveBeenCalledTimes(1);
  });

  it('should reject token with only two parts (no signature)', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64');
    const body = Buffer.from(JSON.stringify({ companyId: 'test' })).toString('base64');
    const token = `${header}.${body}`;

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
  });

  it('should reject token with invalid base64 in payload', () => {
    const req = {
      headers: { authorization: 'Bearer valid-header.!!!invalid-base64!!!.signature' },
    } as unknown as CompanyRequest;

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(UnauthorizedException);
  });

  it('should handle companyId with UUID format', () => {
    const companyId = '550e8400-e29b-41d4-a716-446655440000';
    const token = createMockJwt({ companyId });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    middleware.use(req, mockRes, mockNext);

    expect(req.companyId).toBe(companyId);
  });

  it('should throw correct error message for missing auth header', () => {
    const req = { headers: {} } as unknown as CompanyRequest;

    try {
      middleware.use(req, mockRes, mockNext);
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
      expect((e as UnauthorizedException).message).toContain('Authorization header');
    }
  });

  it('should throw correct error message for invalid token', () => {
    const token = createMockJwt({ sub: 'user-1' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as CompanyRequest;

    try {
      middleware.use(req, mockRes, mockNext);
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
      expect((e as UnauthorizedException).message).toContain('companyId');
    }
  });
});
