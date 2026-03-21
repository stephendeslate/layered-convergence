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

  it('should set companyId from x-company-id header', () => {
    const req = {
      headers: { 'x-company-id': 'company-123' },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.companyId).toBe('company-123');
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException when x-company-id header is missing', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when x-company-id header is empty string', () => {
    const req = {
      headers: { 'x-company-id': '' },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should pass through with valid UUID company id', () => {
    const req = {
      headers: { 'x-company-id': '550e8400-e29b-41d4-a716-446655440000' },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.companyId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should throw error message indicating header is required', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    try {
      middleware.use(req, res, next);
    } catch (e: any) {
      expect(e.message).toContain('x-company-id');
    }
  });

  it('should not modify response object', () => {
    const req = {
      headers: { 'x-company-id': 'company-abc' },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(Object.keys(res)).toHaveLength(0);
  });
});
