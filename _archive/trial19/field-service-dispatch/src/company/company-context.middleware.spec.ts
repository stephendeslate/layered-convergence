import { BadRequestException } from '@nestjs/common';
import { CompanyContextMiddleware } from './company-context.middleware.js';
import { Request, Response } from 'express';

describe('CompanyContextMiddleware', () => {
  let middleware: CompanyContextMiddleware;

  beforeEach(() => {
    middleware = new CompanyContextMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set companyId on request when header is present', () => {
    const req = {
      headers: { 'x-company-id': 'co-1' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect((req as Request & { companyId: string }).companyId).toBe('co-1');
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException when header is missing', () => {
    const req = {
      headers: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when header is an array', () => {
    const req = {
      headers: { 'x-company-id': ['a', 'b'] },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });
});
