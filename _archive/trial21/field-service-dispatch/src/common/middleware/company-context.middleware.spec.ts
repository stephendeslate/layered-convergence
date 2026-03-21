import { describe, it, expect, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CompanyContextMiddleware } from './company-context.middleware.js';

describe('CompanyContextMiddleware', () => {
  const middleware = new CompanyContextMiddleware();

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw BadRequestException when x-company-id header is missing', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when x-company-id is empty string', () => {
    const req = { headers: { 'x-company-id': '' } } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when x-company-id is an array', () => {
    const req = { headers: { 'x-company-id': ['a', 'b'] } } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should set companyId on request and call next when header is valid', () => {
    const req = { headers: { 'x-company-id': 'test-uuid' } } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.companyId).toBe('test-uuid');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should include descriptive error message', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    try {
      middleware.use(req, res, next);
    } catch (err) {
      expect((err as BadRequestException).message).toContain('x-company-id');
    }
  });
});
