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

  it('should set companyId on request when header present', () => {
    const req = { headers: { 'x-company-id': 'c1' } } as any;
    const res = {} as any;
    const next = vi.fn();
    middleware.use(req, res, next);
    expect(req.companyId).toBe('c1');
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException when header missing', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();
    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when header is empty string', () => {
    const req = { headers: { 'x-company-id': '' } } as any;
    const res = {} as any;
    const next = vi.fn();
    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when header is not a string', () => {
    const req = { headers: { 'x-company-id': ['c1', 'c2'] } } as any;
    const res = {} as any;
    const next = vi.fn();
    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });
});
