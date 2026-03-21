import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CompanyContextMiddleware } from './company-context.middleware.js';

describe('CompanyContextMiddleware', () => {
  let middleware: CompanyContextMiddleware;

  beforeEach(() => {
    middleware = new CompanyContextMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw BadRequestException when x-company-id is missing', () => {
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

  it('should throw BadRequestException when x-company-id is array', () => {
    const req = { headers: { 'x-company-id': ['a', 'b'] } } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should set companyId on request when header is valid', () => {
    const req = { headers: { 'x-company-id': 'test-company-id' } } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.companyId).toBe('test-company-id');
    expect(next).toHaveBeenCalled();
  });

  it('should call next when header is valid', () => {
    const req = { headers: { 'x-company-id': 'uuid-value' } } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('should include error message about x-company-id header', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    try {
      middleware.use(req, res, next);
    } catch (e) {
      expect((e as BadRequestException).message).toContain('x-company-id');
    }
  });
});
